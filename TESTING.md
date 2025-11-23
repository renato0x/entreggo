# Guia de Teste - Entreggo Mobile

## 🧪 Como Testar o App

### 1. Iniciar o Servidor de Desenvolvimento

```bash
npm start
```

Isso abrirá o Expo DevTools no navegador.

### 2. Testar no Dispositivo Físico

1. Instale o **Expo Go** no seu smartphone:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Escaneie o QR Code que aparece no terminal ou no navegador

### 3. Testar no Emulador

**Android:**
```bash
npm run android
```

**iOS (apenas macOS):**
```bash
npm run ios
```

## 📱 Fluxos de Teste

### Fluxo de Registro

1. Abra o app (deve mostrar tela de Login)
2. Clique em "Criar conta"
3. Preencha o formulário:
   - Nome: João Silva
   - Email: joao@example.com
   - Telefone: (11) 98765-4321
   - Senha: Senha123
   - Confirmar Senha: Senha123
   - Aceite os termos
4. Clique em "Criar Conta"
5. Deve mostrar tela de "Aguardando Aprovação"

### Fluxo de Login

1. Na tela de Login, insira:
   - Email: seu@email.com
   - Senha: suasenha
2. Clique em "Entrar"
3. Se aprovado, deve navegar para o app principal
4. Se pendente, deve mostrar tela de aprovação

### Fluxo de Recuperação de Senha

1. Na tela de Login, clique em "Esqueceu a senha?"
2. Digite seu email
3. Clique em "Enviar Email"
4. Deve mostrar mensagem de sucesso

### Fluxo de Logout

1. Navegue até a aba "Perfil"
2. Clique em "Sair"
3. Confirme a ação
4. Deve voltar para tela de Login

## 🔍 Validações para Testar

### Email
- ✅ Válido: `usuario@example.com`
- ❌ Inválido: `usuario@`, `@example.com`, `usuario`

### Senha
- ✅ Válida: `Senha123` (maiúscula, minúscula, número)
- ❌ Inválida: `senha` (sem maiúscula e número)
- ❌ Inválida: `12345` (sem letras)

### Telefone
- ✅ Válido: `(11) 98765-4321` (formatação automática)
- ✅ Válido: `11987654321` (será formatado)
- ❌ Inválido: `123` (muito curto)

### Nome
- ✅ Válido: `João Silva`
- ❌ Inválido: `Jo` (menos de 3 caracteres)

## 🐛 Problemas Comuns

### "Network Error" ao fazer login/registro

**Solução:** Verifique se:
1. O backend está rodando
2. A variável `API_BASE_URL` no `.env` está correta
3. Se estiver testando em dispositivo físico, use o IP da sua máquina ao invés de `localhost`

Exemplo:
```
API_BASE_URL=http://192.168.1.100:3000
```

### Tela branca ao iniciar

**Solução:**
1. Limpe o cache do Expo: `npx expo start -c`
2. Reinstale as dependências: `rm -rf node_modules && npm install`

### Erros de TypeScript

**Solução:**
1. Verifique a compilação: `npx tsc --noEmit`
2. Reinicie o servidor de desenvolvimento

## 📊 Estados do Usuário

O app trata diferentes estados de usuário:

1. **Não autenticado** → Mostra AuthStack (Login/Registro)
2. **Autenticado + Pendente** → Mostra tela de "Aguardando Aprovação"
3. **Autenticado + Aprovado** → Mostra AppTabs (Home, Entregas, etc)

## 🔐 Armazenamento Local

O app armazena localmente:
- Token JWT (`@entreggo:token`)
- Dados do usuário (`@entreggo:user`)

Para limpar o armazenamento durante testes:
1. Faça logout pelo app
2. Ou reinstale o app

## 📝 Logs Úteis

Para debug, você pode adicionar console.logs em:
- `src/services/authService.ts` - Requisições de API
- `src/store/authStore.ts` - Mudanças de estado
- `src/navigation/RootNavigator.tsx` - Navegação

## ✅ Checklist de Testes

- [ ] Registro de novo usuário
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Recuperação de senha
- [ ] Validação de campos
- [ ] Navegação entre telas
- [ ] Tela de aprovação pendente
- [ ] Logout
- [ ] Persistência de sessão (fechar e abrir app)
- [ ] Deep linking (se configurado)
