# Entreggo - Mobile App do Entregador

Este é o aplicativo móvel para entregadores da plataforma Entreggo, desenvolvido com React Native e Expo.

## Estrutura do Projeto

O projeto segue uma arquitetura modular e escalável:

- `/src`
  - `/screens`: Telas da aplicação (Auth, App)
  - `/components`: Componentes reutilizáveis
  - `/navigation`: Configuração de navegação (Stacks, Tabs)
  - `/services`: Integrações com APIs e serviços externos
  - `/store`: Gerenciamento de estado global (Zustand)
  - `/types`: Definições de tipos TypeScript
  - `/utils`: Funções utilitárias
  - `/constants`: Constantes da aplicação
  - `/hooks`: Custom hooks

## Pré-requisitos

- Node.js (LTS)
- npm ou yarn
- Expo CLI
- Expo Go app (para testar no dispositivo físico)

## Instalação

1. Clone o repositório
2. Navegue até a pasta do projeto:
   ```bash
   cd entreggo-mobile
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Atualize as variáveis conforme necessário:
     - `API_BASE_URL`: URL do backend NestJS
     - `MAPBOX_TOKEN`: Token do Mapbox para mapas
     - `ENVIRONMENT`: development ou production

## Executando o Projeto

- Iniciar o servidor de desenvolvimento:
  ```bash
  npm start
  ```
- Rodar no Android:
  ```bash
  npm run android
  ```
- Rodar no iOS:
  ```bash
  npm run ios
  ```

## Funcionalidades

### Autenticação
- **Login**: Email e senha com validação
- **Registro**: Cadastro completo com validação de campos
  - Nome completo
  - Email
  - Telefone (com máscara brasileira)
  - Senha (com validação de força)
  - Aceite de termos
- **Recuperação de Senha**: Envio de email para redefinição
- **Aprovação de Cadastro**: Sistema de aprovação por admin
  - Usuários com status "pending" veem tela de aguardando aprovação
  - Usuários aprovados têm acesso completo ao app

### Perfil e Documentos
- **Edição de Perfil**: Dados pessoais editáveis
- **Upload de Documentos**:
  - CNH (frente e verso)
  - Foto da moto
  - Compressão automática de imagens
  - Validação de tamanho (máx 5MB)
  - Status de aprovação por documento
- **Informações da Moto**: Modelo e placa
- **Sistema de Aprovação**: Status visual de cada documento

### Navegação
- **Stack Navigator** para fluxo de autenticação
- **Bottom Tab Navigator** para área logada:
  - Home (Mapa com pedidos disponíveis)
  - Entregas Ativas (Pedidos em andamento)
  - Histórico (Entregas concluídas)
  - Perfil (Dados do entregador, documentos)
- **Deep Linking** configurado para navegação por URL

### Estado Global
- Gerenciado via **Zustand** com 5 stores independentes:
  - AuthStore: Autenticação e usuário
  - LocationStore: Geolocalização e tracking
  - OrderStore: Pedidos e entregas
  - WalletStore: Carteira e transações
  - UIStore: Notificações e estados de UI
- Persistência de token e dados do usuário via **AsyncStorage**
- Verificação automática de autenticação ao iniciar o app
- Custom hooks para acesso fácil ao estado

### Notificações Push
- **Sistema Completo**: Integração com react-native-push-notification
- **Tipos**: Novos pedidos, atualizações de status, mensagens de suporte
- **Configurações**:
  - Controle de som, vibração e badge
  - Horário de silêncio (ex: 22h às 08h)
  - Filtro por tipo de notificação
- **Canais Android**: Prioridades diferenciadas para pedidos urgentes

### WebSocket e Fila Inteligente
- **Comunicação Real-time**: Socket.io para eventos instantâneos
- **Fila Inteligente**: Recebimento de ofertas exclusivas baseadas em score e proximidade
- **Eventos**: Ofertas, Timeouts, Posição na fila
- **Conexão Robusta**: Reconexão automática e sincronização de estado

## Dependências Principais

- **Expo**: Framework React Native
- **React Navigation**: Navegação entre telas
- **Zustand**: Gerenciamento de estado
- **Axios**: Cliente HTTP
- **AsyncStorage**: Armazenamento local
- **Expo Image Picker**: Seleção de imagens
- **Expo Image Manipulator**: Compressão de imagens
- **React Native Maps**: Integração com mapas

## Estrutura de API

O app se comunica com o backend através dos seguintes endpoints:

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo entregador
- `POST /auth/forgot-password` - Recuperação de senha
- `GET /auth/me` - Obter dados do usuário autenticado

### Perfil e Documentos
- `GET /drivers/profile` - Buscar perfil do entregador
- `PUT /drivers/profile` - Atualizar perfil
- `POST /drivers/documents` - Upload de documentos
- `GET /drivers/approval-status` - Status de aprovação
- `DELETE /drivers/documents/:type` - Remover documento

## Validações

- **Email**: Formato válido de email
- **Senha**: Mínimo 6 caracteres, com maiúsculas, minúsculas e números
- **Telefone**: Formato brasileiro (10 ou 11 dígitos)
- **Nome**: Mínimo 3 caracteres
- **Imagens**: Máximo 5MB, formatos JPG/PNG

## Documentação Adicional

- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Sistema de gerenciamento de estado
- [PROFILE_UPLOAD.md](./PROFILE_UPLOAD.md) - Upload de documentos e perfil
- [TESTING.md](./TESTING.md) - Guia de testes
- [STRUCTURE.md](./STRUCTURE.md) - Estrutura do projeto

## Notas

- Certifique-se de configurar as chaves de API no arquivo `.env` para que mapas e serviços funcionem corretamente
- O token JWT é armazenado automaticamente após login/registro
- Interceptors do Axios adicionam o token em todas as requisições autenticadas
- Em caso de token expirado (401), o usuário é automaticamente deslogado
- Imagens são comprimidas automaticamente antes do upload

