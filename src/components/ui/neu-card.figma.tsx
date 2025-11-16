import figma from '@figma/code-connect';
import { NeuCard } from './neu-card';

/**
 * Figma Code Connect for NeuCard
 *
 * Links the Figma design to the actual React component implementation.
 */
figma.connect(
  NeuCard,
  'https://www.figma.com/design/ZiDBnkCUiXqBqIjToIE59u?node-id=1002-2002',
  {
    example: (props) => (
      <NeuCard
        variant={props.variant}
        elevation={props.elevation}
        padding={props.padding}
      >
        {props.content}
      </NeuCard>
    ),
    props: {
      variant: figma.enum('Variant', {
        Soft: 'soft',
        Pressed: 'pressed',
        Flat: 'flat',
      }),
      elevation: figma.enum('Elevation', {
        Low: 'low',
        Medium: 'medium',
        High: 'high',
      }),
      padding: figma.enum('Padding', {
        None: 'none',
        Small: 'sm',
        Medium: 'md',
        Large: 'lg',
        XLarge: 'xl',
      }),
      content: figma.children('Content'),
    },
    imports: ["import { NeuCard } from '@/components/ui/neu-card'"],
    instructions: `
ICARUS NeuCard - Padrões de Design

═══════════════════════════════════════════════

1️⃣ VARIANTES

✅ SOFT (Padrão):
- Usa sombras externas
- Aparece "elevado" da superfície
- 90% dos casos de uso

QUANDO USAR:
- Dashboards
- Listas de itens
- Cards informativos
- Containers de conteúdo

EXEMPLO:
<NeuCard variant="soft" elevation="medium" padding="lg">
  <div className="flex items-center gap-4">
    <Icon3D name="wallet" size="lg" />
    <div>
      <p className="text-sm text-gray-600">Saldo Disponível</p>
      <p className="text-2xl font-bold">R$ 125.430,00</p>
    </div>
  </div>
</NeuCard>

─────────────────────────────────────────────────

✅ PRESSED (Pressionado):
- Usa sombras internas
- Aparece "afundado" na superfície
- Para inputs e áreas interativas

QUANDO USAR:
- Áreas de input/formulário
- Zonas de drop
- Estados ativos/selecionados
- Campos de busca

EXEMPLO:
<NeuCard variant="pressed" padding="md">
  <input
    type="search"
    placeholder="Buscar produtos..."
    className="bg-transparent w-full outline-none"
  />
</NeuCard>

─────────────────────────────────────────────────

✅ FLAT:
- Sem sombras neumórficas
- Apenas border
- Modo dark ou minimalista

QUANDO USAR:
- Dark mode
- Design minimalista
- Performance crítica
- Impressão

─────────────────────────────────────────────────

2️⃣ ELEVAÇÃO

NÍVEIS:
- "low" → Cards secundários, footers
- "medium" → Padrão (80% dos casos)
- "high" → Modais, popovers, elementos principais

REGRA: Quanto mais importante, maior a elevação

EXEMPLO HIERARQUIA:
<div className="space-y-4">
  {/* Card principal */}
  <NeuCard elevation="high" padding="lg">
    <h2>Resumo Financeiro</h2>
  </NeuCard>

  {/* Cards secundários */}
  <div className="grid grid-cols-3 gap-4">
    <NeuCard elevation="medium" padding="md">
      <p>Receitas</p>
    </NeuCard>
    <NeuCard elevation="medium" padding="md">
      <p>Despesas</p>
    </NeuCard>
    <NeuCard elevation="medium" padding="md">
      <p>Lucro</p>
    </NeuCard>
  </div>
</div>

─────────────────────────────────────────────────

3️⃣ PADDING

TAMANHOS:
- "none" → Quando usa children com padding próprio
- "sm" → Badges, chips, elementos compactos
- "md" → Padrão (70% dos casos)
- "lg" → Cards principais, formulários
- "xl" → Páginas, seções hero

EXEMPLO:
{/* Card com imagem full-width */}
<NeuCard padding="none">
  <img src="banner.jpg" className="w-full rounded-t-2xl" />
  <div className="p-6">
    <h3>Título</h3>
    <p>Conteúdo</p>
  </div>
</NeuCard>

─────────────────────────────────────────────────

4️⃣ COMPOSIÇÃO

✅ CARD COM ÍCONE 3D:
<NeuCard variant="soft" elevation="medium" padding="lg">
  <div className="flex items-center gap-4">
    <Icon3D name="package" size="lg" />
    <div>
      <h3 className="font-semibold">Estoque</h3>
      <p className="text-gray-600">1.234 itens</p>
    </div>
  </div>
</NeuCard>

─────────────────────────────────────────────────

✅ CARD COM HEADER E FOOTER:
<NeuCard variant="soft" padding="none">
  <div className="p-6 border-b border-gray-200">
    <h3 className="font-bold">Header</h3>
  </div>
  <div className="p-6">
    <p>Conteúdo principal</p>
  </div>
  <div className="p-4 bg-gray-50 rounded-b-2xl">
    <NeuButton variant="soft" size="sm">
      Ação
    </NeuButton>
  </div>
</NeuCard>

─────────────────────────────────────────────────

✅ GRID DE CARDS:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <NeuCard
      key={item.id}
      variant="soft"
      elevation="medium"
      padding="lg"
    >
      <Icon3D name={item.icon} size="lg" />
      <h3 className="mt-4 font-semibold">{item.title}</h3>
      <p className="mt-2 text-gray-600">{item.description}</p>
    </NeuCard>
  ))}
</div>

─────────────────────────────────────────────────

5️⃣ INTERATIVIDADE

✅ CARD CLICÁVEL:
<NeuCard
  variant="soft"
  elevation="medium"
  padding="lg"
  className="cursor-pointer hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,1)] transition-all"
  onClick={handleClick}
  role="button"
  tabIndex={0}
>
  Conteúdo clicável
</NeuCard>

❌ EVITAR:
- Cards clicáveis sem cursor-pointer
- Transições muito rápidas
- Hover em cards não-interativos

─────────────────────────────────────────────────

6️⃣ ACESSIBILIDADE

✅ SEMPRE:
- role="article" para cards de conteúdo
- role="button" para cards clicáveis
- aria-label descritivo
- Navegação por teclado

EXEMPLO:
<NeuCard
  variant="soft"
  padding="lg"
  role="article"
  aria-label="Informações de vendas do mês"
>
  <h3>Vendas</h3>
  <p>R$ 45.000</p>
</NeuCard>

─────────────────────────────────────────────────

7️⃣ CHECKLIST FINAL

Antes de usar NeuCard, verifique:
☐ Variant apropriado (soft na maioria)
☐ Elevation correto (medium padrão)
☐ Padding adequado ao conteúdo
☐ role se for clicável ou informativo
☐ Hover effects se interativo
☐ Hierarquia visual (elevation)

═══════════════════════════════════════════════

🎯 CARDS BEM ESTRUTURADOS = UI PROFISSIONAL!
    `,
  }
);
