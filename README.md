# 🚀 ICARUS v5.0

**ERP Moderno, Inteligente e Neumórfico**

ICARUS é um sistema ERP web-first que substitui sistemas legados com uma solução moderna, orientada por IA, com design neumórfico elegante e performance otimizada.

---

## ✨ Features Principais

- 🎨 **OraclusX Design System** - Interface neumórfica única
- 🤖 **IcarusBrain** - IA integrada (GPT-4)
- 📦 **58 Módulos** - Cobertura completa de processos
- ⚡ **Performance** - Next.js 14 + React Query
- 🔒 **Segurança** - RLS + Auth Supabase
- 📱 **Responsivo** - Mobile-first design
- ♿ **Acessível** - WCAG 2.1 AA
- 🔄 **Realtime** - Sincronização automática

---

## 🛠️ Stack Tecnológico

```typescript
{
  frontend: "Next.js 14 + TypeScript 5.0",
  styling: "Tailwind CSS 3.4",
  designSystem: "OraclusX (Neumórfico)",
  state: "Zustand + React Query",
  forms: "React Hook Form + Zod",
  backend: "Next.js API Routes",
  database: "Supabase (PostgreSQL)",
  auth: "Supabase Auth",
  ia: "IcarusBrain (GPT-4)",
  tests: "Jest + Playwright"
}
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta Supabase
- API Key OpenAI (para IA)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/icarus.git
cd icarus

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute migrations do banco
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Componentes React
│   │   ├── ui/             # OraclusX DS components
│   │   └── shared/         # Componentes compartilhados
│   ├── modules/            # 58 módulos de negócio
│   │   ├── vendas/
│   │   ├── compras/
│   │   ├── financeiro/
│   │   ├── estoque/
│   │   └── .../
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── public/                 # Assets estáticos
├── docs/                   # Documentação
└── tests/                  # Testes
```

---

## 🎨 OraclusX Design System

Design neumórfico com foco em profundidade e elegância.

### Paleta

```css
--bg-primary: #0f1419       /* Background escuro */
--accent-primary: #3b82f6   /* Azul principal */
--text-primary: #f3f4f6     /* Texto branco */
```

### Exemplo

```tsx
<button className="
  bg-gradient-to-br from-blue-500 to-blue-600
  px-6 py-3 rounded-xl
  text-white font-medium
  shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]
  hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
  transition-all duration-200
">
  Ação
</button>
```

📖 **Documentação completa**: `SKILL_ORACLUSX_DS.md`

---

## 🤖 IA Integration (IcarusBrain)

### Serviços Disponíveis

- **Predict**: Previsões (vendas, demanda, preços)
- **Analyze**: Análises (comportamento, performance)
- **Recommend**: Recomendações (upsell, retenção)
- **Chat**: Assistente conversacional

### Exemplo

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function MyComponent() {
  const { predict, loading } = useIcarusBrain()

  const handleForecast = async () => {
    const result = await predict({
      type: 'sales_forecast',
      data: { historical: salesData }
    })
  }
}
```

📖 **Documentação completa**: `SKILL_IA_INTEGRATION.md`

---

## 📦 Módulos (58)

### Vendas (8)
Pedidos, Orçamentos, Clientes, Comissões, Metas, Pipeline, Propostas, Análises

### Compras (6)
Pedidos, Cotações, Fornecedores, Solicitações, Aprovações, Análises

### Financeiro (12)
Contas a Pagar/Receber, Fluxo de Caixa, Bancos, Conciliação, Títulos, Cheques, Cartões, Boletos, PIX, Previsões, DRE

### Estoque (8)
Produtos, Movimentações, Inventário, Lotes, Armazéns, Transferências, Requisições, Análises

### Fiscal (6)
NF-e, NFS-e, CT-e, SPED Fiscal, SPED Contribuições, Livros Fiscais

### Produção (5)
Ordens de Produção, Estrutura, Roteiro, Apontamentos, PCP

### Qualidade (3)
Inspeções, Não Conformidades, Certificados

### RH (6)
Funcionários, Folha, Ponto, Férias, Benefícios, Treinamentos

### BI & Analytics (4)
Dashboards, Relatórios, KPIs, Alertas Inteligentes

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E
npm run test:e2e
```

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod
```

### Docker

```bash
# Build
docker build -t icarus .

# Run
docker run -p 3000:3000 icarus
```

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `INDEX.md` | Índice mestre (LEIA PRIMEIRO) |
| `CLAUDE.md` | Contexto para Claude Code |
| `.clinerules` | Regras de desenvolvimento |
| `SKILL_ORACLUSX_DS.md` | Design System completo |
| `SKILL_CRIAR_MODULOS.md` | Como criar módulos |
| `SKILL_IA_INTEGRATION.md` | Integração IA |
| `SKILL_SUPABASE.md` | Patterns database |
| `TROUBLESHOOTING.md` | Resolução de problemas |
| `ICARUS_V5_CONSOLIDADO_DEFINITIVO.md` | Documento mestre |

---

## 🗺️ Roadmap

### Q1 2025
- [x] Core ERP modules (58)
- [x] OraclusX Design System
- [x] IcarusBrain integration
- [ ] Mobile app (React Native)

### Q2 2025
- [ ] Code Connect integration
- [ ] Advanced Analytics Dashboard
- [ ] WhatsApp integration
- [ ] E-commerce module

### Q3 2025
- [ ] Multi-tenant support
- [ ] API pública
- [ ] Marketplace de integrações

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add AmazingFeature'`)
4. Push para o branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Regras

- Seguir `.clinerules`
- TypeScript strict mode
- Testes obrigatórios
- Documentação atualizada

---

## 📝 Licença

MIT License - veja `LICENSE` para detalhes

---

## 👥 Time

**Desenvolvido com ❤️ pela equipe ICARUS**

---

## 📞 Suporte

- 📧 Email: suporte@icarus.com.br
- 💬 Discord: [Link do Discord]
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/icarus/issues)

---

**Versão**: 5.0.0
**Status**: ✅ Em desenvolvimento ativo

🚀 **Transformando ERPs com IA e Design Neumórfico!**
