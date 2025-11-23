# Tela de Aguardando Aprovação - Entreggo Mobile

## 🎯 Visão Geral

Tela profissional e amigável exibida quando o perfil do entregador está aguardando aprovação do administrador. Inclui polling automático, feedback visual e opções de suporte.

## ✨ Funcionalidades Implementadas

### 1. **Interface Visual**
- ✅ Ícone animado com efeito de pulsação
- ✅ Mensagem clara e amigável
- ✅ Design profissional com cores que transmitem espera
- ✅ Layout responsivo e centralizado

### 2. **Progresso da Aprovação**
Exibe 3 etapas do processo:

1. **Documentos Enviados** 📄
   - Status: Completo/Pendente
   - Verifica se CNH e foto da moto foram enviados

2. **Análise em Andamento** 🔍
   - Status: Ativo quando em análise
   - Indicador de loading animado

3. **Aprovação do Admin** ✅
   - Status: Pendente até aprovação
   - Muda para completo quando aprovado

### 3. **Status dos Documentos**
- Badge visual para CNH (Aprovado/Pendente/Rejeitado/Não enviado)
- Badge visual para Moto (Aprovado/Pendente/Rejeitado/Não enviado)
- Exibição de motivos de rejeição (se aplicável)
- Cores diferenciadas por status

### 4. **Polling Automático**
- ✅ Verifica status a cada 30 segundos
- ✅ Pausa quando app está em background (economia de bateria)
- ✅ Retoma quando app volta ao foreground
- ✅ Redirecionamento automático quando aprovado
- ✅ Notificação de sucesso ao ser aprovado

### 5. **Ações Disponíveis**
- **Contatar Suporte**: Abre WhatsApp ou email
- **Verificar Status Agora**: Força verificação imediata
- **Pull to Refresh**: Atualiza dados puxando para baixo
- **Logout**: Permite sair da conta

### 6. **Informações Exibidas**
- Nome do usuário
- Email cadastrado
- Telefone
- Status de cada documento
- Tempo estimado (até 24 horas)

## 🔧 Implementação Técnica

### **useApprovalPolling Hook**

Custom hook que gerencia o polling automático.

```typescript
const {
  approvalStatus,    // Status atual da aprovação
  isPolling,         // Se está fazendo polling
  error,             // Erro (se houver)
  checkApprovalStatus, // Função para verificar manualmente
  startPolling,      // Iniciar polling
  stopPolling,       // Parar polling
} = useApprovalPolling();
```

**Características:**
- Polling a cada 30 segundos
- Gerenciamento de AppState (pausa em background)
- Atualização automática do usuário quando aprovado
- Limpeza automática ao desmontar
- Tratamento de erros

### **Estrutura do Hook**

```typescript
interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  cnhStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  vehicleStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  rejectionReasons?: {
    cnh?: string;
    vehicle?: string;
  };
}
```

## 🎨 Design e UX

### **Cores por Status**

| Status | Cor | Hex |
|--------|-----|-----|
| Completo | Verde | #34C759 |
| Ativo/Pendente | Laranja | #FF9500 |
| Não iniciado | Cinza | #8E8E93 |
| Erro/Rejeitado | Vermelho | #FF3B30 |
| Info | Azul | #007AFF |

### **Animações**

1. **Ícone Pulsante**
   - Escala de 1.0 a 1.1
   - Duração: 1 segundo
   - Loop infinito
   - Transmite sensação de "processando"

2. **Loading Indicators**
   - ActivityIndicator durante polling
   - RefreshControl no pull-to-refresh

### **Feedback Visual**

- ✅ Badge colorido para cada status
- ✅ Ícones emoji para melhor compreensão
- ✅ Caixas de informação destacadas
- ✅ Mensagens de erro em vermelho claro
- ✅ Indicador de polling ativo

## 📱 Fluxo de Uso

1. **Usuário faz login com perfil pendente**
2. **AppNavigator detecta status "pending"**
3. **Exibe PendingApprovalScreen**
4. **Hook inicia polling automático**
5. **A cada 30s, verifica status no backend**
6. **Se aprovado:**
   - Atualiza estado do usuário
   - Exibe notificação de sucesso
   - AppNavigator redireciona para tabs principais
7. **Se rejeitado:**
   - Exibe motivo da rejeição
   - Permite editar e reenviar documentos

## 🔗 Integração com Backend

### **Endpoint de Status**

```typescript
GET /drivers/approval-status

Response:
{
  status: 'pending' | 'approved' | 'rejected' | 'incomplete',
  cnhStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded',
  vehicleStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded',
  rejectionReasons?: {
    cnh?: string,
    vehicle?: string
  }
}
```

## 💡 Otimizações de Performance

### **Economia de Bateria**

1. **Pausa em Background**
   ```typescript
   AppState.addEventListener('change', (nextAppState) => {
     if (appState === 'background') {
       stopPolling(); // Para polling
     } else if (appState === 'active') {
       startPolling(); // Retoma polling
     }
   });
   ```

2. **Intervalo Inteligente**
   - 30 segundos (não sobrecarrega servidor)
   - Verifica imediatamente ao voltar ao foreground
   - Para quando usuário é aprovado

3. **Cleanup Automático**
   - useEffect com cleanup
   - clearInterval ao desmontar
   - Remove listeners de AppState

## 🎯 Casos de Uso

### **Caso 1: Documentos Não Enviados**
- Exibe "Documentos Enviados" como pendente
- Permite navegar para editar perfil
- Orienta a enviar documentos

### **Caso 2: Em Análise**
- Exibe "Análise em Andamento" como ativo
- Mostra loading indicator
- Polling ativo verificando status

### **Caso 3: Documento Rejeitado**
- Exibe motivo da rejeição
- Badge vermelho no documento
- Permite reenviar documento

### **Caso 4: Aprovado**
- Notificação de sucesso
- Redirecionamento automático
- Acesso completo ao app

## 📞 Contato com Suporte

### **WhatsApp**
```typescript
const whatsappUrl = `whatsapp://send?phone=${number}&text=${message}`;
Linking.openURL(whatsappUrl);
```

### **Email (Fallback)**
```typescript
const emailUrl = `mailto:suporte@entreggo.com?subject=...&body=...`;
Linking.openURL(emailUrl);
```

## ✅ Checklist de Funcionalidades

- ✅ Tela exibida quando perfil não aprovado
- ✅ Polling a cada 30 segundos
- ✅ Pausa polling em background
- ✅ Redirecionamento automático ao aprovar
- ✅ Notificação de sucesso
- ✅ Botão de contatar suporte (WhatsApp/Email)
- ✅ Pull to refresh
- ✅ Exibição de progresso visual
- ✅ Status de cada documento
- ✅ Motivos de rejeição
- ✅ Animação de ícone
- ✅ Design profissional e amigável
- ✅ Tratamento de erros
- ✅ Logout disponível

## 🚀 Melhorias Futuras

- [ ] Push notifications quando aprovado
- [ ] Chat em tempo real com suporte
- [ ] Upload de documentos direto da tela
- [ ] Histórico de tentativas de aprovação
- [ ] Estimativa de tempo de aprovação
- [ ] FAQ integrado

## 📊 Métricas

- **Polling Interval**: 30 segundos
- **Tempo médio de aprovação**: Até 24 horas
- **Taxa de aprovação**: A ser medida
- **Tempo de resposta do suporte**: A ser medida

## 🔐 Segurança

- Token JWT validado em cada requisição
- Polling para apenas quando usuário não está autenticado
- Dados sensíveis não expostos no frontend
- Comunicação segura com backend (HTTPS)

---

**A tela de Aguardando Aprovação está 100% funcional e pronta para uso!** 🎉
