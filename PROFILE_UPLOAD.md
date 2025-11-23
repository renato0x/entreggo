# Tela de Perfil com Upload de Documentos - Entreggo Mobile

## 📸 Funcionalidades Implementadas

### 1. **Dados Pessoais**
- Nome completo (editável)
- Email (somente leitura)
- Telefone (editável)
- Data de nascimento (editável)
- Salvamento automático ao clicar em "Salvar Alterações"

### 2. **Upload de Documentos**
- **CNH Frente**: Upload com validação
- **CNH Verso**: Upload com validação
- **Status de validação**: Pendente/Aprovado/Rejeitado
- **Motivo de rejeição**: Exibido quando documento é rejeitado

### 3. **Informações da Moto**
- Modelo (editável)
- Placa (editável)
- Foto da moto (upload)
- Status de validação

### 4. **Status de Aprovação Geral**
- Badge visual no topo do perfil
- Estados: Incompleto, Pendente, Aprovado, Rejeitado
- Cores diferenciadas por status

## 🎨 Componentes Criados

### **DocumentUpload** (`components/DocumentUpload.tsx`)
Componente reutilizável para upload de documentos.

**Props:**
```typescript
interface DocumentUploadProps {
  title: string;
  documentType: 'cnh_front' | 'cnh_back' | 'vehicle_photo';
  imageUrl?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  onUpload: (uri: string, fileName: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}
```

**Funcionalidades:**
- Escolher imagem da câmera ou galeria
- Prévia da imagem antes do upload
- Compressão automática de imagens
- Validação de tamanho (máx 5MB)
- Indicador de progresso durante upload
- Status visual (aprovado/rejeitado/pendente)
- Botões para alterar ou remover imagem

## 🔧 Serviços Implementados

### **imagePickerService** (`services/imagePickerService.ts`)
Gerencia seleção e processamento de imagens.

**Métodos:**
- `requestCameraPermission()`: Solicita permissão de câmera
- `requestMediaLibraryPermission()`: Solicita permissão de galeria
- `pickFromCamera()`: Abre câmera para tirar foto
- `pickFromGallery()`: Abre galeria para escolher foto
- `compressImage(uri)`: Comprime imagem para 1024px de largura
- `validateImageSize(size)`: Valida tamanho máximo de 5MB
- `generateFileName(type)`: Gera nome único para arquivo

**Configurações:**
```typescript
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSED_WIDTH = 1024;
const COMPRESSION_QUALITY = 0.8;
```

### **profileService** (`services/profileService.ts`)
Integração com API do backend.

**Endpoints:**
```typescript
GET    /drivers/profile              // Buscar perfil
PUT    /drivers/profile              // Atualizar perfil
POST   /drivers/documents            // Upload de documento
GET    /drivers/approval-status      // Status de aprovação
DELETE /drivers/documents/:type      // Remover documento
```

## 📝 Tipos TypeScript

### **DriverProfile**
```typescript
interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  
  // Documents
  cnhFrontUrl?: string;
  cnhBackUrl?: string;
  cnhStatus: DocumentStatus;
  cnhRejectionReason?: string;
  
  // Vehicle
  vehicleModel?: string;
  vehiclePlate?: string;
  vehiclePhotoUrl?: string;
  vehicleStatus: DocumentStatus;
  vehicleRejectionReason?: string;
  
  // Status
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'incomplete';
}
```

### **DocumentStatus**
```typescript
type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'not_uploaded';
```

## 🎯 Fluxo de Upload

1. **Usuário clica no componente DocumentUpload**
2. **Sistema mostra opções**: Câmera ou Galeria
3. **Usuário seleciona imagem**
4. **Sistema valida tamanho** (máx 5MB)
5. **Sistema comprime imagem** (1024px, 80% qualidade)
6. **Prévia é exibida** localmente
7. **Upload é iniciado** para o backend
8. **Status muda para "Pendente"**
9. **Admin analisa e aprova/rejeita**
10. **Status atualiza** para Aprovado ou Rejeitado

## 🔐 Permissões Necessárias

### iOS (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos acessar sua câmera para tirar fotos dos documentos",
        "NSPhotoLibraryUsageDescription": "Precisamos acessar sua galeria para selecionar fotos"
      }
    }
  }
}
```

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## 💡 Uso do Componente

```typescript
import { DocumentUpload } from '../components/DocumentUpload';
import { profileService } from '../services/profileService';

const handleUpload = async (uri: string, fileName: string) => {
  await profileService.uploadDocument({
    documentType: 'cnh_front',
    file: { uri, name: fileName, type: 'image/jpeg' }
  });
};

<DocumentUpload
  title="CNH - Frente"
  documentType="cnh_front"
  imageUrl={profile.cnhFrontUrl}
  status={profile.cnhStatus}
  rejectionReason={profile.cnhRejectionReason}
  onUpload={handleUpload}
  onDelete={() => profileService.deleteDocument('cnh_front')}
/>
```

## 🎨 Estados Visuais

### Status de Documento
- **Não enviado**: Cinza (#8E8E93)
- **Pendente**: Laranja (#FF9500)
- **Aprovado**: Verde (#34C759)
- **Rejeitado**: Vermelho (#FF3B30)

### Feedback Visual
- Loading spinner durante upload
- Prévia da imagem após seleção
- Badge de status colorido
- Caixa de rejeição (se rejeitado)

## 📱 Responsividade

- Layout adaptável para diferentes tamanhos de tela
- Imagens redimensionadas automaticamente
- ScrollView com RefreshControl
- Teclado não sobrepõe inputs

## ✅ Validações

- **Tamanho de arquivo**: Máximo 5MB
- **Formato**: JPG/PNG (convertido para JPEG)
- **Dimensões**: Redimensionado para 1024px de largura
- **Permissões**: Verifica antes de acessar câmera/galeria

## 🚀 Próximos Passos

- [ ] Adicionar crop de imagem
- [ ] Implementar OCR para validação de CNH
- [ ] Adicionar múltiplos uploads simultâneos
- [ ] Implementar preview em tela cheia
- [ ] Adicionar filtros de imagem
- [ ] Implementar upload em background

## 📦 Dependências

- `expo-image-picker`: Seleção de imagens
- `expo-image-manipulator`: Compressão e redimensionamento
- `expo-file-system`: Manipulação de arquivos
- `axios`: Upload para API

## 🔗 Integração com Backend

O backend deve aceitar `multipart/form-data` no endpoint `/drivers/documents`:

```typescript
POST /drivers/documents
Content-Type: multipart/form-data

{
  documentType: 'cnh_front' | 'cnh_back' | 'vehicle_photo',
  file: File
}

Response:
{
  url: string,
  documentType: string
}
```
