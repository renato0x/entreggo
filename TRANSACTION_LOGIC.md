# Lógica de Aceite de Pedido e Concorrência

## 🎯 Objetivo
Garantir que **apenas um entregador** consiga aceitar um pedido, mesmo que múltiplos tentem simultaneamente (Race Condition).

## 🛡️ Solução Técnica

### 1. Backend (NestJS + PostgreSQL)

Utilizamos **Transações de Banco de Dados** com **Lock Pessimista** (`SELECT ... FOR UPDATE`).

#### Fluxo da Transação:
1.  **Início da Transação**: `BEGIN TRANSACTION`
2.  **Leitura com Bloqueio**:
    ```sql
    SELECT * FROM orders WHERE id = $1 FOR UPDATE;
    ```
    *   Isso bloqueia a linha do pedido. Se outro entregador tentar ler/escrever nesta linha ao mesmo tempo, ele terá que esperar a transação atual terminar.
3.  **Verificação de Estado**:
    *   Se `status != 'OFFERED'`, lança erro `409 Conflict`.
    *   Se entregador não habilitado, lança erro `403 Forbidden`.
4.  **Atualização**:
    ```sql
    UPDATE orders SET status = 'ACCEPTED', driver_id = $2, accepted_at = NOW() WHERE id = $1;
    ```
5.  **Commit**: `COMMIT`

#### Por que Lock Pessimista?
Como a janela de tempo entre a verificação ("está disponível?") e a ação ("aceitar") é crítica e a probabilidade de conflito é alta (vários entregadores recebendo a oferta ao mesmo tempo), o lock pessimista garante integridade absoluta, serializando os aceites no nível do banco de dados.

### 2. Mobile (React Native)

#### Componente `AcceptOrderButton`
*   **Feedback Imediato**: Exibe `ActivityIndicator` ao tocar.
*   **Tratamento de Erro 409**:
    *   Se o backend retornar `409 Conflict`, o app exibe um alerta: *"Este pedido já foi aceito por outro entregador."*
    *   A UI é revertida e o entregador volta ao estado anterior.
*   **Integração**: Usa `orderService.acceptOrder` (REST) para garantir a resposta transacional, em vez de apenas emitir um evento de socket.

## 🧪 Cenários de Teste

| Cenário | Entregador A | Entregador B | Resultado Esperado |
|---------|--------------|--------------|--------------------|
| **Aceite Sucesso** | Tenta aceitar (0ms) | - | **Sucesso (200)**. Pedido atribuído a A. |
| **Race Condition** | Tenta aceitar (0ms) | Tenta aceitar (10ms) | **A: Sucesso (200)**. <br> **B: Erro (409)** "Já aceito". |
| **Pedido Expirado** | Tenta aceitar após timeout | - | **Erro (409 ou 404)**. Pedido não disponível. |
| **Entregador Bloqueado** | Tenta aceitar | - | **Erro (403)**. "Não habilitado". |

## 📄 Arquivos Relacionados
*   `backend/src/orders/orders.service.ts`: Lógica de transação.
*   `backend/src/orders/orders.controller.ts`: Endpoint REST.
*   `src/components/AcceptOrderButton.tsx`: UI Mobile.
*   `src/hooks/useWebSocket.ts`: Integração.
