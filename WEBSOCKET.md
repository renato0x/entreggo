# Sistema de WebSocket e Fila Inteligente - Entreggo Mobile

## 🔌 Visão Geral

Sistema de comunicação em tempo real baseado em WebSocket (Socket.io) para gerenciar a distribuição de pedidos, rastreamento de localização e notificações instantâneas. Projetado para funcionar com uma arquitetura de fila inteligente no backend.

## ✨ Funcionalidades

### 1. **Conexão Persistente**
- ✅ Conexão automática ao autenticar
- ✅ Reconexão automática (retry com backoff)
- ✅ Gerenciamento de estado (Background/Foreground)
- ✅ Autenticação via Token JWT

### 2. **Eventos de Pedido (Fila Inteligente)**
- ✅ `order-offered`: Recebe oferta exclusiva (Topo da fila)
- ✅ `order-timeout`: Notifica quando tempo para aceitar expira
- ✅ `order-queue-position`: Atualiza posição na fila de espera
- ✅ `accept-offer`: Envia aceite do pedido
- ✅ `reject-offer`: Rejeita oferta atual

### 3. **Rastreamento em Tempo Real**
- ✅ Envio periódico de localização (`location-update`)
- ✅ Otimizado para não sobrecarregar a rede
- ✅ Sincronizado com `useLocation` hook

## 🔧 Implementação Técnica

### **webSocketService**
Serviço singleton que encapsula `socket.io-client`.

```typescript
// Conectar
webSocketService.connect(token);

// Ouvir eventos
webSocketService.on('order-offered', (offer) => {
  console.log('Nova oferta:', offer);
});

// Enviar ações
webSocketService.acceptOffer('order_123');
```

### **useWebSocket Hook**
Hook para integração com componentes React.

```typescript
const {
  status,         // 'connected' | 'disconnected' | 'connecting'
  currentOffer,   // Oferta atual (se houver)
  queuePosition,  // Posição na fila
  acceptOffer,    // Função para aceitar
  rejectOffer     // Função para rejeitar
} = useWebSocket();
```

## 📡 Protocolo de Eventos

### **Client -> Server**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `location-update` | `{ lat, lng, ... }` | Atualiza localização do entregador |
| `join-queue` | `{ available: boolean }` | Entra/Sai da fila de disponibilidade |
| `accept-offer` | `{ orderId: string }` | Aceita a oferta atual |
| `reject-offer` | `{ orderId, reason }` | Rejeita a oferta atual |

### **Server -> Client**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `order-offered` | `OrderOffer` | Nova oferta de pedido (exclusiva) |
| `order-timeout` | `{ orderId }` | Tempo da oferta expirou |
| `order-queue-position` | `{ position, waitTime }` | Atualização de posição na fila |
| `new-order` | `{ orderId }` | Broadcast genérico (opcional) |
| `order-accepted` | `{ orderId }` | Pedido aceito por outro (broadcast) |

## 🧠 Lógica de Fila Inteligente (Backend)

O app mobile é apenas a ponta do iceberg. O backend implementa:

1.  **Score Combinado**: `(Reputação * 0.6) + (Proximidade * 0.4)`
2.  **Fila Sequencial**: Oferta enviada apenas para o Top 1.
3.  **Timeout**: 30 segundos para aceitar.
4.  **Fallback**: Se timeout/rejeite, passa para o próximo.

## 📱 Fluxo de Oferta

1.  Backend calcula fila e envia `order-offered` para Entregador A.
2.  App recebe evento e exibe notificação "Nova Oferta! 🚀".
3.  Entregador A tem 30s para aceitar.
    *   **Se aceitar**: Envia `accept-offer`. Backend confirma e notifica sucesso.
    *   **Se rejeitar**: Envia `reject-offer`. Backend remove da fila e chama Entregador B.
    *   **Se ignorar**: Backend envia `order-timeout` após 30s e chama Entregador B.

## ✅ Checklist de Implementação

- ✅ Conexão Socket.io configurada
- ✅ Autenticação no handshake
- ✅ Tratamento de reconexão
- ✅ Hook `useWebSocket` implementado
- ✅ Integração com `useLocation`
- ✅ Integração com `useNotifications`
- ✅ Tipagem TypeScript completa

---

**Sistema de WebSocket pronto para alta performance e tempo real!** ⚡
