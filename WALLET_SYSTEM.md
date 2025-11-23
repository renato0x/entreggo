# 💰 Sistema de Carteira Virtual - Entreggo

## 📋 Visão Geral

Sistema completo de carteira virtual para entregadores, incluindo saldo, histórico de transações, ganhos e solicitação de saques.

---

## 🏗️ Arquitetura

### **Backend (NestJS)**

#### Entidades

**1. Wallet**
```typescript
{
  id: UUID
  driverId: UUID
  balance: Decimal(10,2)
  totalEarnings: Decimal(10,2)
  totalWithdrawals: Decimal(10,2)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**2. WalletTransaction**
```typescript
{
  id: UUID
  walletId: UUID
  type: TransactionType
  amount: Decimal(10,2)
  description: String
  orderId?: UUID
  withdrawalId?: UUID
  withdrawalStatus?: WithdrawalStatus
  balanceBefore?: Decimal(10,2)
  balanceAfter?: Decimal(10,2)
  metadata?: JSON
  createdAt: DateTime
}
```

#### Tipos de Transação

| Tipo | Descrição | Crédito/Débito |
|------|-----------|----------------|
| `DELIVERY_COMPLETED` | Entrega concluída | ✅ Crédito |
| `DELIVERY_CANCELLED` | Entrega cancelada | ❌ Débito |
| `WITHDRAWAL_REQUESTED` | Saque solicitado | ❌ Débito |
| `WITHDRAWAL_PROCESSED` | Saque processado | ❌ Débito |
| `WITHDRAWAL_CANCELLED` | Saque cancelado | ✅ Crédito |
| `REFUND` | Reembolso | ✅ Crédito |
| `BONUS` | Bônus | ✅ Crédito |
| `PENALTY` | Penalidade | ❌ Débito |

#### Endpoints

**GET /drivers/wallet**
```json
Response:
{
  "success": true,
  "data": {
    "balance": 250.50,
    "totalEarnings": 1500.00,
    "totalWithdrawals": 1249.50,
    "monthlyEarnings": 450.00,
    "weeklyEarnings": 120.00,
    "updatedAt": "2025-11-20T23:00:00Z"
  }
}
```

**GET /drivers/wallet/transactions**
```
Query Params:
- limit: number (default: 20)
- offset: number (default: 0)
- type: TransactionType
- startDate: ISO Date
- endDate: ISO Date
- minAmount: number
- maxAmount: number
- search: string

Response:
{
  "success": true,
  "data": [...transactions],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**POST /drivers/wallet/withdraw**
```json
Request:
{
  "amount": 100.00,
  "bankAccount": "Banco X, Ag 1234, CC 56789",
  "notes": "Saque mensal"
}

Response:
{
  "success": true,
  "message": "Withdrawal requested successfully",
  "data": {
    "id": "uuid",
    "amount": 100.00,
    "fee": 0.00,
    "finalAmount": 100.00,
    "status": "PENDING",
    "requestedAt": "2025-11-20T23:00:00Z"
  }
}
```

**GET /drivers/wallet/withdrawals**
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 100.00,
      "status": "PENDING",
      "requestedAt": "2025-11-20T23:00:00Z",
      "bankAccount": "Banco X, Ag 1234, CC 56789"
    }
  ]
}
```

---

### **Mobile (React Native)**

#### Componentes

**1. WalletScreen.tsx**
- Exibe saldo atual em destaque
- Mostra ganhos da semana e do mês
- Lista transações recentes (últimas 10)
- Botão para solicitar saque
- Pull-to-refresh
- Estatísticas de ganhos

**2. TransactionList.tsx**
- Lista de transações com paginação
- Ícones coloridos por tipo
- Formatação de data inteligente (Hoje, Ontem, etc.)
- Cores diferentes para crédito/débito
- Status de saques
- Empty state

**3. WithdrawModal.tsx**
- Campo de valor com formatação automática
- Validação de saldo mínimo (R$ 50)
- Validação de saldo disponível
- Campo de conta bancária (opcional)
- Campo de observações (opcional)
- Resumo do saque (valor, taxa, total)
- Confirmação de sucesso

---

## 💡 Funcionalidades

### ✅ Implementadas

1. **Visualização de Saldo**
   - Saldo atual em destaque
   - Total ganho (lifetime)
   - Total sacado (lifetime)
   - Ganhos da semana
   - Ganhos do mês

2. **Histórico de Transações**
   - Listagem com paginação (20 por vez)
   - Filtros por tipo, data, valor
   - Busca por descrição
   - Ordenação (mais recente primeiro)
   - Ícones e cores por tipo
   - Formatação de data inteligente

3. **Solicitação de Saque**
   - Validação de valor mínimo (R$ 50)
   - Validação de saldo disponível
   - Cálculo de taxa (se houver)
   - Confirmação visual
   - Notificação de sucesso

4. **Segurança**
   - Autenticação JWT
   - Lock pessimista em transações
   - Validações de saldo
   - Registro de balanceBefore/After

---

## 🎨 Design

### Cores

```css
Primary: #6366F1 (Indigo)
Success: #22C55E (Green)
Danger: #EF4444 (Red)
Warning: #F59E0B (Amber)
Info: #3B82F6 (Blue)

Background: #F9FAFB
Card: #FFFFFF
Text Primary: #1F2937
Text Secondary: #6B7280
Text Tertiary: #9CA3AF
Border: #E5E7EB
```

### Ícones por Tipo de Transação

| Tipo | Ícone | Cor |
|------|-------|-----|
| DELIVERY_COMPLETED | checkmark-circle | Verde |
| DELIVERY_CANCELLED | close-circle | Vermelho |
| WITHDRAWAL | cash | Azul |
| REFUND | return-up-back | Verde |
| BONUS | gift | Roxo |
| PENALTY | warning | Vermelho |

---

## 🔄 Fluxo de Uso

### 1. Visualizar Carteira

```
ENTREGADOR ABRE APP
  ↓
NAVEGA PARA CARTEIRA
  ↓
CARREGA SALDO E TRANSAÇÕES
  ↓
VISUALIZA:
  - Saldo disponível
  - Ganhos da semana
  - Ganhos do mês
  - Últimas 10 transações
```

### 2. Solicitar Saque

```
CLICA EM "SOLICITAR SAQUE"
  ↓
MODAL ABRE
  ↓
DIGITA VALOR
  ↓
VALIDAÇÕES:
  - Mínimo R$ 50? ✓
  - Saldo suficiente? ✓
  ↓
PREENCHE DADOS BANCÁRIOS (opcional)
  ↓
CONFIRMA SAQUE
  ↓
SAQUE CRIADO (STATUS: PENDING)
  ↓
NOTIFICAÇÃO AO ADMIN
  ↓
AGUARDA PROCESSAMENTO
```

### 3. Ver Histórico Completo

```
CLICA EM "VER TODAS"
  ↓
NAVEGA PARA TELA DE TRANSAÇÕES
  ↓
APLICA FILTROS (opcional):
  - Por tipo
  - Por data
  - Por valor
  - Por descrição
  ↓
SCROLL PARA CARREGAR MAIS
  ↓
PAGINAÇÃO AUTOMÁTICA
```

---

## 📊 Exemplos de Uso

### Adicionar Crédito (Entrega Concluída)

```typescript
await walletService.addCredit(
  driverId,
  25.50,
  TransactionType.DELIVERY_COMPLETED,
  'Entrega #abc123 concluída',
  'abc123'
);
```

### Deduzir Valor (Cancelamento)

```typescript
await walletService.deductAmount(
  driverId,
  10.00,
  TransactionType.PENALTY,
  'Penalidade por cancelamento',
  'abc123'
);
```

### Solicitar Saque

```typescript
const withdrawal = await walletService.requestWithdrawal(driverId, {
  amount: 100.00,
  bankAccount: 'Banco X, Ag 1234, CC 56789',
  notes: 'Saque mensal'
});
```

---

## 🧪 Testes

### Backend

```typescript
describe('WalletService', () => {
  it('should create wallet for new driver', async () => {
    const wallet = await service.getOrCreateWallet(driverId);
    expect(wallet.balance).toBe(0);
  });

  it('should add credit correctly', async () => {
    await service.addCredit(driverId, 50, ...);
    const summary = await service.getWalletSummary(driverId);
    expect(summary.balance).toBe(50);
  });

  it('should reject withdrawal below minimum', async () => {
    await expect(
      service.requestWithdrawal(driverId, { amount: 25 })
    ).rejects.toThrow('Minimum withdrawal amount');
  });

  it('should reject withdrawal above balance', async () => {
    await expect(
      service.requestWithdrawal(driverId, { amount: 1000 })
    ).rejects.toThrow('Insufficient balance');
  });
});
```

### Mobile

```typescript
describe('WalletScreen', () => {
  it('should display balance correctly', () => {
    const { getByText } = render(<WalletScreen />);
    expect(getByText(/R\$ 250\.50/)).toBeTruthy();
  });

  it('should open withdraw modal', () => {
    const { getByText } = render(<WalletScreen />);
    fireEvent.press(getByText('Solicitar Saque'));
    expect(getByText('Solicitar Saque')).toBeTruthy();
  });
});
```

---

## 🚀 Otimizações

### Performance

1. **Paginação**
   - Carregar apenas 20 transações por vez
   - Scroll infinito com lazy loading

2. **Cache**
   - Cachear saldo por 30 segundos
   - Invalidar cache após transações

3. **Índices no Banco**
   ```sql
   CREATE INDEX idx_wallet_driver ON wallets(driverId);
   CREATE INDEX idx_transaction_wallet ON wallet_transactions(walletId);
   CREATE INDEX idx_transaction_created ON wallet_transactions(createdAt DESC);
   CREATE INDEX idx_transaction_type ON wallet_transactions(type);
   ```

### UX

1. **Pull-to-Refresh**
   - Atualizar saldo e transações

2. **Loading States**
   - Skeleton screens
   - Shimmer effects

3. **Error Handling**
   - Retry automático
   - Mensagens claras

---

## 🔐 Segurança

### Validações

- ✅ Autenticação JWT em todos os endpoints
- ✅ Validação de saldo antes de débito
- ✅ Lock pessimista em transações
- ✅ Registro de balanceBefore/After para auditoria
- ✅ Validação de valor mínimo de saque
- ✅ Sanitização de inputs

### Auditoria

Todas as transações registram:
- Saldo anterior
- Saldo posterior
- Timestamp
- Metadata (informações adicionais)

---

## 📱 Screenshots (Conceito)

### Tela Principal
```
┌─────────────────────────────┐
│   💰 Minha Carteira    ⏰   │
│                             │
│  ┌─────────────────────┐    │
│  │  💼 Saldo Disponível│    │
│  │  R$ 250,50          │    │
│  │  [Solicitar Saque]  │    │
│  └─────────────────────┘    │
│                             │
│  ┌──────┐  ┌──────┐         │
│  │📅 Sem│  │📊 Mês│         │
│  │120,00│  │450,00│         │
│  └──────┘  └──────┘         │
│                             │
│  Total Ganho | Total Sacado │
│  R$ 1.500,00 | R$ 1.249,50  │
│                             │
│  📋 Transações Recentes     │
│  ┌─────────────────────┐    │
│  │ ✅ Entrega #123     │    │
│  │ Hoje 14:30  +R$25,50│    │
│  ├─────────────────────┤    │
│  │ 💰 Saque Solicitado │    │
│  │ Ontem 10:00 -R$100  │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Modal de Saque
```
┌─────────────────────────────┐
│  Solicitar Saque        ✕   │
│                             │
│  ┌─────────────────────┐    │
│  │ Saldo Disponível    │    │
│  │ R$ 250,50           │    │
│  │ Mínimo: R$ 50,00    │    │
│  └─────────────────────┘    │
│                             │
│  Valor do Saque             │
│  ┌─────────────────────┐    │
│  │ R$ [____100,00____] │    │
│  └─────────────────────┘    │
│                             │
│  Conta Bancária (Opcional)  │
│  ┌─────────────────────┐    │
│  │ Banco, Ag, Conta    │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Valor: R$ 100,00    │    │
│  │ Taxa: R$ 0,00       │    │
│  │ Você Receberá:      │    │
│  │ R$ 100,00           │    │
│  └─────────────────────┘    │
│                             │
│  [Cancelar][Solicitar Saque]│
└─────────────────────────────┘
```

---

## ✅ Critérios de Aceitação - COMPLETOS

- ✅ Saldo é exibido corretamente
- ✅ Transações são listadas com paginação
- ✅ Filtros funcionam (tipo, data, valor, busca)
- ✅ Saque pode ser solicitado
- ✅ Validação de saldo mínimo funciona (R$ 50)
- ✅ Validação de saldo disponível funciona
- ✅ Responsivo em diferentes tamanhos
- ✅ Performance boa mesmo com muitas transações
- ✅ Pull-to-refresh implementado
- ✅ Loading states implementados
- ✅ Error handling implementado
- ✅ Formatação de valores em BRL
- ✅ Formatação de datas inteligente

---

**Sistema de Carteira Virtual Completo!** 💰✅
