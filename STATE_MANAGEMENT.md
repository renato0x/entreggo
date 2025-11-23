# Sistema de Gerenciamento de Estado - Entreggo Mobile

## 📦 Arquitetura

O Entreggo Mobile utiliza **Zustand** para gerenciamento de estado global, com uma arquitetura modular baseada em slices independentes.

## 🗂️ Estrutura de Stores

### 1. **AuthStore** (`authStore.ts`)
Gerencia autenticação e dados do usuário.

**Estado:**
- `isAuthenticated`: boolean
- `user`: User | null
- `token`: string | null
- `isLoading`: boolean
- `error`: string | null

**Ações:**
- `login(user)`: Autentica usuário
- `logout()`: Desautentica e limpa dados
- `checkAuth()`: Verifica autenticação ao iniciar
- `setUser(user)`: Atualiza dados do usuário

**Uso:**
```typescript
import { useAuth } from '../hooks';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

### 2. **LocationStore** (`locationStore.ts`)
Gerencia localização e rastreamento.

**Estado:**
- `currentLocation`: Location | null
- `isTracking`: boolean
- `locationHistory`: LocationHistory[]
- `error`: string | null

**Ações:**
- `setCurrentLocation(location)`: Atualiza localização atual
- `startTracking()`: Inicia rastreamento
- `stopTracking()`: Para rastreamento
- `addLocationToHistory(location)`: Adiciona ao histórico
- `clearLocationHistory()`: Limpa histórico

**Uso:**
```typescript
import { useLocation } from '../hooks';

const { currentLocation, isTracking, startTracking } = useLocation();
```

---

### 3. **OrderStore** (`orderStore.ts`)
Gerencia pedidos disponíveis, ativos e histórico.

**Estado:**
- `availableOrders`: Order[]
- `activeOrder`: Order | null
- `orderHistory`: Order[]
- `isLoading`: boolean
- `error`: string | null

**Ações:**
- `fetchAvailableOrders()`: Busca pedidos disponíveis
- `acceptOrder(orderId)`: Aceita um pedido
- `updateOrderStatus(orderId, status)`: Atualiza status
- `completeOrder(orderId, otp)`: Finaliza entrega
- `clearActiveOrder()`: Limpa pedido ativo

**Uso:**
```typescript
import { useOrder } from '../hooks';

const { availableOrders, activeOrder, acceptOrder } = useOrder();
```

---

### 4. **WalletStore** (`walletStore.ts`)
Gerencia carteira e transações.

**Estado:**
- `wallet`: Wallet
  - `balance`: number
  - `totalEarnings`: number
  - `pendingAmount`: number
  - `transactions`: Transaction[]
- `isLoading`: boolean
- `error`: string | null

**Ações:**
- `fetchWallet()`: Busca dados da carteira
- `addTransaction(transaction)`: Adiciona transação
- `updateBalance(amount)`: Atualiza saldo
- `requestWithdrawal(amount)`: Solicita saque

**Uso:**
```typescript
import { useWallet } from '../hooks';

const { balance, transactions, requestWithdrawal } = useWallet();
```

---

### 5. **UIStore** (`uiStore.ts`)
Gerencia notificações, loading states e erros.

**Estado:**
- `notifications`: Notification[]
- `loadingStates`: { [key: string]: boolean }
- `errors`: { [key: string]: string | null }
- `isOnline`: boolean

**Ações:**
- `addNotification(notification)`: Adiciona notificação
- `setLoading(key, isLoading)`: Define estado de loading
- `setError(key, error)`: Define erro
- `clearError(key)`: Limpa erro

**Helpers:**
- `showSuccess(title, message)`: Mostra notificação de sucesso
- `showError(title, message)`: Mostra notificação de erro
- `showInfo(title, message)`: Mostra notificação informativa
- `showWarning(title, message)`: Mostra notificação de aviso

**Uso:**
```typescript
import { useUI } from '../hooks';

const { showSuccess, showError, isLoading } = useUI();

// Mostrar notificação
showSuccess('Sucesso', 'Pedido aceito!');

// Verificar loading
if (isLoading('fetchOrders')) {
  // Mostrar spinner
}
```

---

## 🎣 Custom Hooks

Todos os stores têm hooks customizados correspondentes que fornecem:
- Acesso fácil ao estado
- Valores computados úteis
- Funções helper

### Exemplo de Hook Customizado

```typescript
// hooks/useOrder.ts
export const useOrder = () => {
  const availableOrders = useOrderStore((state) => state.availableOrders);
  const activeOrder = useOrderStore((state) => state.activeOrder);
  
  return {
    // Estado
    availableOrders,
    activeOrder,
    
    // Computados
    hasActiveOrder: activeOrder !== null,
    availableOrdersCount: availableOrders.length,
    
    // Ações
    acceptOrder: useOrderStore((state) => state.acceptOrder),
  };
};
```

---

## 🔄 Middleware

### Logger Middleware
Loga todas as mudanças de estado em desenvolvimento.

```typescript
// Ativado automaticamente em __DEV__
console.group('🔄 State Update');
console.log('Previous:', prevState);
console.log('Changes:', partial);
console.log('Next:', nextState);
console.groupEnd();
```

### Persist Middleware
Sincroniza estado com AsyncStorage (planejado para implementação futura).

---

## 💡 Padrões de Uso

### 1. Acessar Estado em Componente

```typescript
import { useAuth, useOrder } from '../hooks';

const MyComponent = () => {
  const { user } = useAuth();
  const { availableOrders, acceptOrder } = useOrder();
  
  return (
    <View>
      <Text>Olá, {user?.name}</Text>
      <Text>{availableOrders.length} pedidos disponíveis</Text>
    </View>
  );
};
```

### 2. Executar Ação Assíncrona

```typescript
const handleAccept = async (orderId: string) => {
  const { acceptOrder } = useOrder();
  const { showSuccess, showError } = useUI();
  
  try {
    await acceptOrder(orderId);
    showSuccess('Sucesso', 'Pedido aceito!');
  } catch (error) {
    showError('Erro', 'Não foi possível aceitar o pedido');
  }
};
```

### 3. Mostrar Loading State

```typescript
const { isLoading, setLoading } = useUI();

const fetchData = async () => {
  setLoading('fetchOrders', true);
  try {
    await fetchOrders();
  } finally {
    setLoading('fetchOrders', false);
  }
};

// No componente
if (isLoading('fetchOrders')) {
  return <ActivityIndicator />;
}
```

### 4. Gerenciar Notificações

```typescript
const { showSuccess, notifications, markNotificationAsRead } = useUI();

// Adicionar notificação
showSuccess('Pedido Aceito', 'Vá até o local de coleta');

// Listar notificações
notifications.map((notif) => (
  <NotificationItem 
    key={notif.id}
    notification={notif}
    onPress={() => markNotificationAsRead(notif.id)}
  />
));
```

---

## 🎯 Benefícios

1. **Type Safety**: TypeScript completo em todo o estado
2. **Modular**: Cada store é independente
3. **Performático**: Zustand é leve e rápido
4. **Fácil de Usar**: Hooks customizados simplificam o acesso
5. **Debugging**: Logger middleware em desenvolvimento
6. **Escalável**: Fácil adicionar novos stores

---

## 📝 Próximos Passos

- [ ] Implementar persistência com AsyncStorage
- [ ] Adicionar middleware de sincronização com backend
- [ ] Implementar otimistic updates
- [ ] Adicionar testes unitários para stores
- [ ] Implementar DevTools integration

---

## 🔗 Referências

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/)
