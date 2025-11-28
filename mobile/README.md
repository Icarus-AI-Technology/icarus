# ICARUS Mobile - App para Instrumentadores

## 📱 Visão Geral

Aplicativo React Native para instrumentadores cirúrgicos, permitindo operações hands-free durante procedimentos.

## 🚀 Tecnologias

- **React Native** 0.73+
- **Expo** SDK 50
- **TypeScript** 5.x
- **React Navigation** 6.x
- **React Query** para cache e sincronização
- **Supabase** para backend
- **Expo Speech** para comandos de voz

## 📦 Instalação

```bash
# Instalar dependências
cd mobile
npm install

# Iniciar em desenvolvimento
npm start

# iOS
npm run ios

# Android
npm run android
```

## 🏗️ Estrutura

```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── cirurgias.tsx  # Lista de cirurgias
│   │   ├── estoque.tsx    # Consulta estoque
│   │   └── perfil.tsx     # Perfil do usuário
│   ├── cirurgia/
│   │   └── [id].tsx       # Detalhes da cirurgia
│   └── _layout.tsx        # Layout principal
├── components/
│   ├── ui/                # Componentes base
│   ├── cirurgia/          # Componentes de cirurgia
│   └── voice/             # Componentes de voz
├── hooks/
│   ├── useVoice.ts        # Hook de comandos de voz
│   ├── useCirurgias.ts    # Hook de cirurgias
│   └── useAuth.ts         # Hook de autenticação
├── lib/
│   ├── supabase.ts        # Cliente Supabase
│   └── voice-commands.ts  # Comandos de voz
├── constants/
│   └── Colors.ts          # Paleta Dark Glass
└── assets/
    └── images/
```

## 🎨 Design System

Seguimos o **Dark Glass Medical** design system:

```typescript
const Colors = {
  dark: {
    background: '#0B0D16',
    card: '#15192B',
    cardElevated: '#1A1F35',
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
  },
  light: {
    background: '#F1F5F9',
    card: '#FFFFFF',
    primary: '#6366F1',
    text: '#0F172A',
    textSecondary: '#64748B',
  }
}
```

## 🎙️ Comandos de Voz

O app suporta comandos de voz hands-free:

| Comando | Ação |
|---------|------|
| "Próxima cirurgia" | Mostra próxima cirurgia |
| "Kit da cirurgia" | Lista materiais OPME |
| "Confirmar uso" | Registra uso de material |
| "Chamar suporte" | Aciona suporte técnico |
| "Estoque do produto X" | Consulta estoque |

## 📱 Funcionalidades

### Dashboard
- KPIs do dia
- Próximas cirurgias
- Alertas de estoque
- Atalhos rápidos

### Cirurgias
- Lista de cirurgias do dia
- Detalhes do procedimento
- Kit OPME necessário
- Registro de uso em tempo real
- Status do paciente

### Estoque
- Consulta de produtos
- Scan de código de barras
- Verificação de lote/validade
- Solicitação de material

### Perfil
- Dados do instrumentador
- Histórico de cirurgias
- Configurações de voz
- Notificações

## 🔐 Autenticação

```typescript
// Login com credenciais ICARUS
const { signIn } = useAuth()
await signIn(email, password)

// Autenticação biométrica
const { authenticateWithBiometrics } = useBiometrics()
await authenticateWithBiometrics()
```

## 📡 Sincronização Offline

O app funciona offline com sincronização automática:

```typescript
// Dados são cacheados localmente
const { data, isOffline } = useCirurgias()

// Ações são enfileiradas quando offline
const { mutate, isPending } = useRegistrarUso()
mutate({ produtoId, quantidade })
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E (Detox)
npm run e2e
```

## 📄 Licença

Proprietário - ICARUS ERP © 2025

