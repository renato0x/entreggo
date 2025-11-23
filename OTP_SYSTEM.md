# 🔐 Sistema de OTP para Confirmação de Entrega

## 🎯 Visão Geral

Sistema completo de geração e validação de códigos OTP (One-Time Password) para garantir a segurança na confirmação de entregas. O código é enviado automaticamente via WhatsApp para o destinatário.

## ✨ Funcionalidades

### Backend (NestJS)

#### 1. **Geração de OTP**
- ✅ Código de 4 dígitos aleatórios (`crypto.randomInt(1000, 9999)`)
- ✅ Armazenamento em tabela `order_otps`
- ✅ TTL de 1 hora
- ✅ Máximo de 3 tentativas de validação
- ✅ Invalidação automática de códigos anteriores

#### 2. **Integração WhatsApp (Evolution API)**
- ✅ Envio automático ao confirmar retirada
- ✅ Mensagem personalizada com nome da loja e entregador
- ✅ Formatação automática de número de telefone
- ✅ Tratamento de erro se WhatsApp falhar
- ✅ Opção de reenvio manual

#### 3. **Validação de OTP**
- ✅ Verificação de expiração
- ✅ Contagem de tentativas
- ✅ Bloqueio após 3 tentativas erradas
- ✅ Marcação como usado após validação

### Mobile (React Native)

#### 1. **Tela de Confirmação de Retirada**
- ✅ Informações do estabelecimento
- ✅ Instruções claras sobre o processo
- ✅ Botão de confirmação com loading
- ✅ Validação antes de prosseguir

#### 2. **Exibição do Código OTP**
- ✅ Código em destaque (48px, azul)
- ✅ Botão para copiar código
- ✅ Compartilhamento via WhatsApp
- ✅ Status de envio do WhatsApp
- ✅ Horário de expiração

#### 3. **Fluxo de Navegação**
```
DeliveryDetailsScreen
    ↓ (Botão "Cheguei na Retirada")
PickupConfirmationScreen
    ↓ (Confirmar Retirada)
[Gera OTP + Envia WhatsApp]
    ↓ (Exibe Código)
[Compartilha com Cliente]
    ↓ (Continuar)
DeliveryDetailsScreen (status: IN_TRANSIT)
```

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
backend/src/
├── otp/
│   ├── entities/
│   │   └── order-otp.entity.ts       # Entity TypeORM
│   └── otp.service.ts                # Lógica de OTP
├── whatsapp/
│   └── whatsapp.service.ts           # Integração Evolution API
└── orders/
    ├── orders.controller.ts          # Endpoint /start-delivery
    └── orders.service.ts             # Método startDelivery

mobile/src/
├── screens/app/
│   └── PickupConfirmationScreen.tsx  # Tela de confirmação
├── services/
│   └── otpService.ts                 # Chamadas API
└── types/
    └── otp.ts                        # Tipos TypeScript
```

### Banco de Dados

#### Tabela `order_otps`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| orderId | UUID | FK para orders |
| code | VARCHAR(4) | Código OTP |
| expiresAt | TIMESTAMP | Data de expiração |
| attempts | INT | Tentativas de validação |
| maxAttempts | INT | Máximo de tentativas (3) |
| isUsed | BOOLEAN | Se foi validado |
| createdAt | TIMESTAMP | Data de criação |

## 🔌 Endpoints API

### POST `/orders/:id/start-delivery`

Inicia a entrega, gera OTP e envia WhatsApp.

**Request:**
```json
{
  // Autenticação via JWT (req.user)
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* Order object */ },
  "otpCode": "1234",
  "whatsappSent": true,
  "expiresAt": "2025-11-21T00:25:18.000Z"
}
```

**Erros:**
- `404`: Pedido não encontrado
- `409`: Pedido não está pronto para entrega
- `403`: Pedido pertence a outro entregador

### POST `/orders/:id/validate-otp`

Valida o código OTP informado pelo cliente.

**Request:**
```json
{
  "code": "1234"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Código validado com sucesso!"
}
```

**Erros:**
```json
{
  "valid": false,
  "message": "Código incorreto. 2 tentativa(s) restante(s).",
  "attemptsRemaining": 2
}
```

### POST `/orders/:id/resend-otp`

Reenvia o código OTP via WhatsApp.

**Response:**
```json
{
  "sent": true
}
```

## 📱 Mensagem WhatsApp

```
🚚 *Entreggo - Código de Confirmação*

Olá! Sua encomenda da *[Nome da Loja]* está a caminho com [Nome do Entregador].

Para receber sua entrega, informe este código:

🔐 *1234*

⏰ Este código expira em 1 hora.

_Não compartilhe este código com ninguém além do entregador._
```

## 🔒 Segurança

### Medidas Implementadas

1. **Código Aleatório**: Usa `crypto.randomInt()` para máxima aleatoriedade
2. **Expiração**: Código válido por apenas 1 hora
3. **Tentativas Limitadas**: Máximo de 3 tentativas erradas
4. **Uso Único**: Código invalidado após validação bem-sucedida
5. **Transação**: Geração dentro de transação de banco de dados
6. **Lock Pessimista**: Previne race conditions

### Fluxo de Segurança

```
1. Entregador confirma retirada
2. Sistema gera código aleatório
3. Código armazenado com timestamp
4. WhatsApp enviado ao cliente
5. Cliente recebe código
6. Cliente informa código ao entregador
7. Entregador valida código no app
8. Sistema verifica:
   - Código existe?
   - Está expirado?
   - Tentativas < 3?
   - Código correto?
9. Se válido: Marca como usado
10. Se inválido: Incrementa tentativas
```

## 🧪 Testes

### Cenários de Teste

| Cenário | Entrada | Resultado Esperado |
|---------|---------|-------------------|
| **Geração Normal** | Confirmar retirada | Código gerado, WhatsApp enviado |
| **Validação Correta** | Código válido | Sucesso |
| **Código Errado** | "9999" (errado) | Erro, 2 tentativas restantes |
| **3 Tentativas** | 3x código errado | Bloqueado |
| **Código Expirado** | Após 1 hora | Erro de expiração |
| **WhatsApp Falha** | Sem conexão | Código gerado, flag `whatsappSent: false` |
| **Reenvio** | Solicitar reenvio | Novo WhatsApp enviado |

### Teste Manual

1. **Confirmar Retirada:**
   ```bash
   POST /orders/ORDER_ID/start-delivery
   Authorization: Bearer TOKEN
   ```

2. **Validar Código:**
   ```bash
   POST /orders/ORDER_ID/validate-otp
   {
     "code": "1234"
   }
   ```

3. **Verificar Expiração:**
   - Aguardar 1 hora
   - Tentar validar código
   - Deve retornar erro de expiração

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=entreggo
EVOLUTION_API_KEY=your_api_key_here
```

### Instalação Evolution API

1. **Docker:**
   ```bash
   docker run -d \
     --name evolution-api \
     -p 8080:8080 \
     atendai/evolution-api
   ```

2. **Criar Instância:**
   ```bash
   POST http://localhost:8080/instance/create
   {
     "instanceName": "entreggo",
     "token": "your_api_key_here"
   }
   ```

3. **Conectar WhatsApp:**
   - Acessar QR Code: `GET /instance/connect/entreggo`
   - Escanear com WhatsApp

## 🚀 Melhorias Futuras

- [ ] Suporte a SMS como fallback
- [ ] Código de 6 dígitos para maior segurança
- [ ] Biometria para validação
- [ ] Histórico de tentativas de validação
- [ ] Notificação push ao cliente
- [ ] Código alfanumérico
- [ ] Integração com Twilio

---

**Sistema OTP robusto e seguro para entregas!** 🔐✅
