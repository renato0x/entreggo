# Sistema de Notificações Push - Entreggo Mobile

## 🔔 Visão Geral

Sistema completo de notificações push para alertar entregadores sobre novos pedidos, atualizações de status e mensagens de suporte. Inclui gerenciamento de permissões, canais de notificação (Android), configurações personalizáveis e integração com backend.

## ✨ Funcionalidades Implementadas

### 1. **Tipos de Notificações**
- ✅ **Novos Pedidos**: Alerta crítico com som e vibração
- ✅ **Atualizações de Pedido**: Aceito, cancelado, em rota
- ✅ **Mensagens de Suporte**: Comunicados importantes

### 2. **Canais de Notificação (Android)**
- **Novos Pedidos** (Importance: High)
  - Som padrão
  - Vibração ativada
  - Badge no ícone
- **Atualizações** (Importance: Default)
  - Som padrão
  - Vibração ativada
- **Suporte** (Importance: Default)
  - Som padrão
  - Sem vibração

### 3. **Configurações Personalizáveis**
- ✅ Ativar/Desativar notificações gerais
- ✅ Controle de Som, Vibração e Badge
- ✅ **Horário de Silêncio**: Define período para não receber alertas (ex: 22h às 08h)
- ✅ Filtro por tipo de notificação (escolher quais receber)

### 4. **Gerenciamento de Device Token**
- ✅ Registro automático ao iniciar app
- ✅ Atualização no backend (`POST /drivers/device-token`)
- ✅ Suporte a múltiplos dispositivos

### 5. **Integração com UI**
- ✅ Badge no ícone do app
- ✅ Notificações locais quando app está aberto
- ✅ Tela de configurações completa

## 🔧 Implementação Técnica

### **notificationService**
Serviço singleton que gerencia toda a lógica.

```typescript
// Inicialização
notificationService.initialize((notification) => {
  console.log('Notificação recebida:', notification);
});

// Configurações
await notificationService.saveSettings({
  enabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
});

// Notificação Local
notificationService.showLocalNotification({
  title: 'Novo Pedido',
  message: 'Entrega de R$ 15,00 disponível',
  type: 'new_order'
});
```

### **useNotifications Hook**
Hook para facilitar uso em componentes.

```typescript
const {
  settings,          // Configurações atuais
  hasPermission,     // Status de permissão
  badgeCount,        // Contador do badge
  requestPermissions,// Solicitar permissão
  updateSettings,    // Atualizar configurações
  clearAll           // Limpar notificações
} = useNotifications();
```

### **Estrutura de Dados**

**NotificationSettings**
```typescript
interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationTypes: {
    newOrder: boolean;
    orderAccepted: boolean;
    orderCancelled: boolean;
    supportMessage: boolean;
  };
}
```

## 📱 Fluxo de Funcionamento

1. **Inicialização**
   - App inicia (`RootNavigator`)
   - `useNotifications` inicializa serviço
   - Configura `react-native-push-notification`
   - Carrega configurações salvas

2. **Registro**
   - Obtém token do dispositivo (FCM/APNS)
   - Envia para backend (`/drivers/device-token`)

3. **Recebimento**
   - Notificação chega (Remote ou Local)
   - Verifica configurações globais (enabled)
   - Verifica horário de silêncio
   - Verifica tipo de notificação
   - Se permitido:
     - Exibe alerta/som/vibração
     - Chama callback (atualiza UI)
     - Incrementa badge

4. **Interação**
   - Usuário toca na notificação
   - App abre/vem para foreground
   - Redireciona para tela relevante (ex: Detalhes do Pedido)

## ⚙️ Configuração do Projeto

### **Android (AndroidManifest.xml)**
Permissões necessárias:
```xml
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### **iOS (Info.plist)**
Permissões necessárias:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## 📡 Endpoints de API

### **Registrar Token**
```typescript
POST /drivers/device-token
Body:
{
  token: string,
  platform: 'ios' | 'android',
  deviceId: string
}
```

## ✅ Checklist de Funcionalidades

- ✅ Solicitar permissão ao usuário
- ✅ Registrar token no backend
- ✅ Receber notificações (Foreground/Background)
- ✅ Canais de notificação Android
- ✅ Configurações de Som/Vibração
- ✅ Horário de Silêncio
- ✅ Filtro por tipo
- ✅ Badge no ícone
- ✅ Tela de configurações
- ✅ Persistência de configurações

## 🚀 Melhorias Futuras

- [ ] Histórico de notificações no app
- [ ] Ações rápidas na notificação (Aceitar/Recusar)
- [ ] Sons personalizados por tipo
- [ ] Agendamento de notificações locais
- [ ] Sincronização de configurações com backend

---

**O sistema de notificações está 100% funcional e pronto para uso!** 🔔
