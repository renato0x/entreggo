# ⚠️ Fluxo de Exceção - Destinatário Ausente

## 🎯 Visão Geral

Sistema completo para lidar com problemas de entrega, especialmente quando o destinatário está ausente. O estabelecimento decide se descarta o pedido ou solicita devolução, gerando automaticamente uma corrida de volta.

---

## 🔄 Fluxo Completo

```
1. ENTREGADOR CHEGA NO DESTINO
   ↓
2. DESTINATÁRIO AUSENTE
   - Tenta ligar
   - Tenta WhatsApp
   ↓
3. REGISTRA PROBLEMA
   - Botão "Problema na Entrega"
   - Seleciona tipo: RECIPIENT_ABSENT
   - Status: PROBLEM
   ↓
4. AGUARDA DECISÃO DO ESTABELECIMENTO
   - Polling a cada 30s
   - Notificação ao estabelecimento
   ↓
5a. ESTABELECIMENTO DECIDE: DESCARTAR
    - Status: DISCARDED
    - Reembolso ao estabelecimento
    - Pagamento ao entregador (50%)
    - Fim do fluxo
   ↓
5b. ESTABELECIMENTO DECIDE: DEVOLVER
    - Cria corrida de volta
    - Origem = Destino anterior
    - Destino = Estabelecimento
    - Status: RETURNING
    - Entregador aceita automaticamente
    ↓
6. CORRIDA DE VOLTA
   - Mesmo fluxo de entrega
   - Sem necessidade de OTP
   - Apenas confirmação de entrega
   ↓
7. FINALIZAÇÃO
   - Status: RETURNED
   - Pagamento ao entregador
   - Atualização de score
```

---

## 📦 Componentes Implementados

### Backend (NestJS)

#### 1. **DTOs**

**`delivery-problem.dto.ts`**

```typescript
enum ProblemType {
  RECIPIENT_ABSENT
  RECIPIENT_REFUSED
  ADDRESS_NOT_FOUND
  WRONG_ADDRESS
  UNSAFE_LOCATION
  OTHER
}

enum ProblemResolution {
  DISCARD
  RETURN
}
```

#### 2. **Endpoints**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/orders/:id/problem` | POST | Registra problema de entrega |
| `/orders/:id/problem/discard` | POST | Descarta pedido (estabelecimento) |
| `/orders/:id/problem/return` | POST | Cria corrida de volta (estabelecimento) |
| `/orders/:id/status` | GET | Verifica status (polling) |

#### 3. **OrdersService - Novos Métodos**

**`reportProblem(orderId, driverId, problemType, description, attemptedContact)`**
- Valida status (deve ser ARRIVED_AT_DELIVERY ou IN_TRANSIT)
- Atualiza para PROBLEM
- Armazena tipo e descrição do problema
- Notifica estabelecimento via WhatsApp/Push
- Retorna pedido atualizado

**`discardOrder(orderId, notes)`**
- Valida status (deve ser PROBLEM)
- Atualiza para DISCARDED
- Reembolsa estabelecimento (100%)
- Paga entregador (50% do valor)
- Gera comprovante
- Notifica entregador

**`createReturnTrip(orderId, notes)`**
- Valida status (deve ser PROBLEM)
- Cria novo pedido (corrida de volta):
  - Origem = Destino do pedido original
  - Destino = Estabelecimento
  - Mesmo entregador
  - Calcula novo preço
- Atualiza pedido original para RETURNING
- Vincula pedidos (returnOrderId)
- Debita estabelecimento
- Notifica entregador

**`getOrderStatus(orderId)`**
- Retorna status atual
- Retorna resolução do problema
- Retorna ID da corrida de volta (se houver)

---

### Mobile (React Native)

#### 1. **ProblemDeliveryModal.tsx**

**Funcionalidades:**
- ✅ Modal com opções de ação
- ✅ Botão "Ligar para Cliente"
- ✅ Botão "Enviar WhatsApp"
- ✅ Botão "Registrar Problema"
- ✅ Seleção de tipo de problema
- ✅ Campo de descrição
- ✅ Checkbox "Tentei contato"
- ✅ Envio do problema

**UX:**
```
┌─────────────────────────────┐
│   ⚠️ Problema na Entrega    │
│                             │
│  O que aconteceu?           │
│                             │
│  ○ Destinatário ausente     │
│  ○ Destinatário recusou     │
│  ○ Endereço não encontrado  │
│  ○ Endereço errado          │
│  ○ Local inseguro           │
│  ○ Outro                    │
│                             │
│  Descrição (opcional):      │
│  [________________]         │
│                             │
│  ☑ Tentei contato           │
│                             │
│  [  Ligar para Cliente  ]   │
│  [  Enviar WhatsApp  ]      │
│  [  Registrar Problema  ]   │
└─────────────────────────────┘
```

#### 2. **useDeliveryProblemPolling.ts**

**Funcionalidades:**
- ✅ Polling a cada 30 segundos
- ✅ Verifica status do pedido
- ✅ Detecta resolução (DISCARD/RETURN)
- ✅ Para polling ao detectar resolução
- ✅ Otimizado para não consumir bateria

**Implementação:**
```typescript
const useDeliveryProblemPolling = (orderId: string) => {
  const [resolution, setResolution] = useState(null);
  const [returnOrderId, setReturnOrderId] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await orderService.getStatus(orderId);
      
      if (status.problemResolution) {
        setResolution(status.problemResolution);
        setReturnOrderId(status.returnOrderId);
        clearInterval(interval);
      }
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  return { resolution, returnOrderId };
};
```

#### 3. **Tela de Aguardo**

**Funcionalidades:**
- ✅ Exibe mensagem "Aguardando decisão..."
- ✅ Indicador de loading
- ✅ Informações do problema registrado
- ✅ Opção de cancelar (voltar)

**UX:**
```
┌─────────────────────────────┐
│   ⏳ Aguardando Decisão     │
│                             │
│   O estabelecimento foi     │
│   notificado sobre o        │
│   problema.                 │
│                             │
│   Problema registrado:      │
│   Destinatário ausente      │
│                             │
│   ⚙️ Processando...         │
│                             │
│   [  Voltar ao Mapa  ]      │
└─────────────────────────────┘
```

#### 4. **Corrida de Volta**

**Funcionalidades:**
- ✅ Aceite automático
- ✅ Exibição como novo pedido
- ✅ Navegação até estabelecimento
- ✅ Sem necessidade de OTP
- ✅ Confirmação simples de entrega

---

## 💰 Sistema de Pagamento

### Cenário 1: Descarte

```typescript
// Estabelecimento
refund = order.price // 100% de volta

// Entregador
payment = order.price * 0.5 // 50% pela tentativa

// Exemplo:
// Pedido: R$ 20,00
// Estabelecimento recebe: R$ 20,00
// Entregador recebe: R$ 10,00
```

### Cenário 2: Devolução

```typescript
// Corrida de volta
returnPrice = calculatePrice(
  origin: order.deliveryLocation,
  destination: order.establishment
)

// Estabelecimento
charge = returnPrice // Paga pela corrida de volta

// Entregador
payment = returnPrice // Recebe pela corrida de volta

// Exemplo:
// Pedido original: R$ 20,00
// Corrida de volta: R$ 15,00
// Estabelecimento paga: R$ 15,00
// Entregador recebe: R$ 15,00 (+ R$ 20,00 do pedido original)
```

---

## 🔐 Segurança

| Validação | Implementação |
|-----------|---------------|
| **Autorização** | Apenas entregador do pedido pode registrar problema |
| **Status** | Validação de status antes de cada ação |
| **Transação** | Lock pessimista para evitar race conditions |
| **Notificação** | Estabelecimento notificado imediatamente |
| **Polling** | Intervalo de 30s para não sobrecarregar |

---

## 📊 Fluxo de Estados

```
ARRIVED_AT_DELIVERY
  ↓ (registrar problema)
PROBLEM
  ↓ (decisão: descartar)
DISCARDED (fim)

PROBLEM
  ↓ (decisão: devolver)
RETURNING
  ↓ (entregador navega)
ARRIVED_AT_RETURN
  ↓ (confirmar entrega)
RETURNED (fim)
```

---

## 🧪 Casos de Teste

### Registro de Problema

| Cenário | Input | Resultado |
|---------|-------|-----------|
| **Ausente** | RECIPIENT_ABSENT | ✅ Status PROBLEM |
| **Recusa** | RECIPIENT_REFUSED | ✅ Status PROBLEM |
| **Endereço errado** | WRONG_ADDRESS | ✅ Status PROBLEM |
| **Status inválido** | Status != ARRIVED | ❌ Erro 409 |

### Descarte

| Cenário | Condição | Resultado |
|---------|----------|-----------|
| **Sucesso** | Status PROBLEM | ✅ DISCARDED, +50% |
| **Status errado** | Status != PROBLEM | ❌ Erro 409 |

### Devolução

| Cenário | Condição | Resultado |
|---------|----------|-----------|
| **Sucesso** | Status PROBLEM | ✅ Nova corrida criada |
| **Cálculo preço** | Distância 5km | ✅ Preço calculado |
| **Vinculação** | returnOrderId | ✅ Pedidos vinculados |

---

## 🎨 Design System

### Cores

```css
Problem: #F59E0B (Amarelo/Laranja)
Danger: #EF4444 (Vermelho)
Info: #3B82F6 (Azul)
Success: #22C55E (Verde)
```

### Ícones

```
⚠️ Problema
⏳ Aguardando
📞 Ligar
💬 WhatsApp
🔄 Devolver
🗑️ Descartar
```

---

## 🚀 Otimizações

### Polling Inteligente

```typescript
// Aumenta intervalo progressivamente
let interval = 30000; // 30s
let attempts = 0;

const poll = () => {
  attempts++;
  
  // Após 5 minutos, aumenta para 60s
  if (attempts > 10) {
    interval = 60000;
  }
  
  // Após 15 minutos, para
  if (attempts > 20) {
    clearInterval(polling);
    showTimeout();
  }
};
```

### Notificações Push

```typescript
// Em vez de polling, usar push notifications
onPushNotification('problem_resolved', (data) => {
  if (data.resolution === 'DISCARD') {
    showDiscardConfirmation();
  } else if (data.resolution === 'RETURN') {
    acceptReturnTrip(data.returnOrderId);
  }
});
```

---

## 📱 Integrações

### WhatsApp (Notificação ao Estabelecimento)

```
🚨 *Entreggo - Problema na Entrega*

Pedido: #abc123
Entregador: João Silva
Problema: Destinatário ausente

O entregador tentou contato mas não conseguiu entregar.

O que deseja fazer?
1️⃣ Descartar pedido
2️⃣ Solicitar devolução

Acesse o painel para decidir:
https://app.entreggo.com/orders/abc123
```

### Telefone (Ligar para Cliente)

```typescript
const handleCall = () => {
  const phoneNumber = order.deliveryLocation.phone;
  Linking.openURL(`tel:${phoneNumber}`);
};
```

---

## 🎯 Critérios de Aceitação - IMPLEMENTADOS

- ✅ Fluxo de problema funciona
- ✅ Estabelecimento recebe notificação
- ✅ Corrida de volta é criada corretamente
- ✅ Entregador é remunerado (50% no descarte)
- ✅ Polling funciona sem consumir bateria (30s)
- ✅ Responsivo em diferentes tamanhos
- ✅ Tipos de problema bem definidos
- ✅ Validações de segurança
- ✅ Feedback visual claro

---

**Sistema robusto de tratamento de exceções implementado!** ⚠️✅🔄
