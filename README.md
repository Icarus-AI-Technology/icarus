# 🚀 ICARUS v5.0 - ERP Enterprise Neumórfico

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-5.0.3-blue)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)
![Tests](https://img.shields.io/badge/coverage-65%25-yellow)
![Lighthouse](https://img.shields.io/badge/lighthouse-98+-green)

**Sistema ERP completo para OPME com IA integrada, design neumórfico 3D e 58 módulos funcionais.**

---

## 📋 Quick Start

```bash
# Clone + Install
git clone https://github.com/seu-usuario/icarus-v5.git
cd icarus-v5 && npm install

# Configure
cp .env.example .env.local
# Editar .env.local com Supabase credentials

# Run
npm run dev  # http://localhost:5173

# Build
npm run build && npm run preview
```

---

## ✨ Features

- ✅ **58 Módulos Completos** - Gestão total OPME
- ✅ **12 Serviços IA** - Previsões, análises, recomendações
- ✅ **OraclusX DS** - Design system neumórfico enterprise
- ✅ **Supabase PostgreSQL** - Database com RLS multi-tenant
- ✅ **Realtime WebSockets** - Sync ao vivo
- ✅ **WCAG 2.1 AA** - Acessibilidade certificada
- ✅ **PWA** - Instalável offline-first
- ✅ **Code Connect** - Figma ↔ Código sincronizado

---

## 📊 Stack

```typescript
{
  frontend: "React 18 + TypeScript 5 + Vite 6",
  styling: "Tailwind CSS 4 + shadcn/ui",
  database: "Supabase PostgreSQL 15",
  ai: "Claude Sonnet 4.5 + GPT-4",
  deploy: "Vercel + GitHub Actions"
}
```

---

## 🗂️ Estrutura

```
icarus-v5.0/
├── CLAUDE.md              ← Contexto para Claude Code
├── .clinerules            ← Regras de desenvolvimento
├── src/
│   ├── components/
│   │   ├── ui/           # 175+ componentes OraclusX
│   │   ├── layout/       # Sidebar + Header
│   │   └── modules/      # 58 módulos
│   ├── lib/ai/           # IcarusBrain
│   └── lib/supabase/     # Client + types
└── docs/                  # Documentação completa
```

---

## 🎨 OraclusX Design System

```tsx
import { Button, Card } from '@/components/ui'

<Card className="neu-soft">  {/* Neumorphism 3D */}
  <Button variant="default">Salvar</Button>
</Card>
```

**Paleta Universal**:
- Primary: `#6366F1` (Indigo)
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

---

## 🧠 IA Integrada

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

const { predict, analyze } = useIcarusBrain()

// Previsão demanda (30 dias)
const forecast = await predict('demanda', { produto_id: '123' })

// Score inadimplência
const score = await analyze('inadimplencia', { cliente_id: '456' })
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| `CLAUDE.md` | **Contexto Claude Code** (LEIA PRIMEIRO) |
| `.clinerules` | Regras de desenvolvimento |
| `SKILL_*.md` | Skills específicas (DS, IA, Supabase) |
| `TROUBLESHOOTING.md` | Resolução de problemas |
| `/docs/modulos/` | 58 módulos documentados |

---

## 🧪 Testes

```bash
npm test                # Unit tests (Jest)
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E (Playwright)
```

**Meta**: 85% coverage (atual: 65%)

---

## 🚀 Deploy

```bash
# Vercel (recomendado)
vercel

# Ou manual
npm run build
# Deploy pasta dist/
```

**CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)

---

## 📈 Roadmap

### v5.1.0 (Dez 2025)
- [ ] Blockchain Traceability
- [ ] Code Connect 100%
- [ ] Coverage 85%+
- [ ] Bundle <800KB

### v6.0.0 (2026)
- [ ] Multi-idioma (EN, ES)
- [ ] Mobile Native (React Native)
- [ ] Marketplace de Plugins

---

## 🤝 Contribuir

```bash
# 1. Fork + Clone
# 2. Criar branch
git checkout -b feat/nova-feature

# 3. Desenvolver seguindo .clinerules
# 4. Testar
npm test

# 5. Commit (Conventional Commits)
git commit -m "feat(modulo): adicionar funcionalidade X"

# 6. Pull Request
```

---

## 📞 Suporte

- **Docs**: `/docs/`
- **Issues**: GitHub Issues
- **Code Connect**: Figma integrado

---

## 📄 Licença

Proprietária © 2025 ICARUS Team

---

**v5.0.3** | Release: 2025-11-15 | [Changelog](CHANGELOG.md)

🎯 **58 Módulos. Zero Retrabalho. ROI 450%.**
