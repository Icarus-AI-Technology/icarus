import figma from '@figma/code-connect';
import { NeuButton } from './neu-button';

/**
 * Figma Code Connect for NeuButton
 *
 * Links the Figma design to the actual React component implementation.
 * Replace 1001-2001 with the actual node ID from Figma.
 *
 * To find the node ID:
 * 1. Open the component in Figma
 * 2. Right-click → "Copy link to selection"
 * 3. URL will be: .../file?node-id=123-456
 * 4. Node ID = "123:456" (replace - with :)
 */
figma.connect(
  NeuButton,
  'https://www.figma.com/design/ZiDBnkCUiXqBqIjToIE59u?node-id=1001-2001',
  {
    example: (props) => (
      <NeuButton
        variant={props.variant}
        size={props.size}
        disabled={props.disabled}
        loading={props.loading}
        icon={props.icon}
        iconPosition={props.iconPosition}
      >
        {props.label}
      </NeuButton>
    ),
    props: {
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
        Soft: 'soft',
        Pressed: 'pressed',
        Danger: 'danger',
      }),
      size: figma.enum('Size', {
        Small: 'sm',
        Medium: 'md',
        Large: 'lg',
        XLarge: 'xl',
      }),
      disabled: figma.boolean('Disabled'),
      loading: figma.boolean('Loading'),
      icon: figma.instance('Icon'),
      iconPosition: figma.enum('IconPosition', {
        Left: 'left',
        Right: 'right',
      }),
      label: figma.string('Label'),
    },
    imports: ["import { NeuButton } from '@/components/ui/neu-button'"],
    instructions: `
ICARUS NeuButton - Padrões Obrigatórios

═══════════════════════════════════════════════

1️⃣ ACESSIBILIDADE (A11Y)

✅ SEMPRE INCLUIR:
- aria-label quando houver apenas ícone
- Desabilitar corretamente (disabled={true})
- Focus visible para teclado
- Feedback sonoro para screen readers

❌ NUNCA:
- Usar div com onClick (sempre <button>)
- Esquecer aria-label em botões de ícone
- Usar apenas cor para indicar estado

EXEMPLO:
<NeuButton
  variant="soft"
  icon={<Icon3D name="trash" />}
  onClick={handleDelete}
  aria-label="Deletar item"
  disabled={isDeleting}
/>

─────────────────────────────────────────────────

2️⃣ NEUMORPHISM DESIGN

✅ VARIANTS:
- "soft" → Ações principais (salvar, confirmar)
- "pressed" → Estado ativo/selecionado
- "secondary" → Ações secundárias (cancelar)
- "danger" → Ações destrutivas (deletar)
- "primary" → CTAs principais (iniciar, começar)

❌ EVITAR:
- Combinar variants diferentes sem motivo
- Usar variant errado para contexto

EXEMPLO DASHBOARD:
<NeuButton variant="soft">Nova Venda</NeuButton>
<NeuButton variant="secondary">Filtros</NeuButton>
<NeuButton variant="danger">Cancelar</NeuButton>

─────────────────────────────────────────────────

3️⃣ ÍCONES 3D

✅ SEMPRE USAR Icon3D:
import { Icon3D } from '@/components/ui/icon-3d';

<NeuButton
  icon={<Icon3D name="save" />}
  iconPosition="left"
>
  Salvar
</NeuButton>

POSIÇÕES:
- "left" → Ação de escrita (salvar, criar)
- "right" → Ação de navegação (próximo, enviar)

❌ NUNCA:
- Usar lucide-react para ações principais
- Colocar ícone sem iconPosition
- Usar mais de 1 ícone por botão

─────────────────────────────────────────────────

4️⃣ LOADING STATE

✅ OBRIGATÓRIO em ações assíncronas:

<NeuButton
  loading={isSaving}
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? 'Salvando...' : 'Salvar'}
</NeuButton>

COMPORTAMENTO:
- Mostra spinner automático
- Desabilita automaticamente
- Muda texto para feedback
- Mantém largura consistente

─────────────────────────────────────────────────

5️⃣ CONFIRMAÇÕES

✅ AÇÕES DESTRUTIVAS precisam confirmar:

<NeuButton
  variant="danger"
  confirmDialog={{
    title: "Confirmar exclusão",
    message: "Isso não pode ser desfeito",
    confirmText: "Deletar",
    cancelText: "Cancelar"
  }}
  onClick={handleDelete}
>
  Deletar
</NeuButton>

─────────────────────────────────────────────────

6️⃣ TAMANHOS

CONTEXTOS:
- "sm" → Tabelas, cards compactos
- "md" → Padrão (80% dos casos)
- "lg" → CTAs principais, headers
- "xl" → Landing pages, hero sections

─────────────────────────────────────────────────

7️⃣ EXEMPLOS COMPLETOS

FORMULÁRIO TÍPICO:
<div className="flex gap-3 justify-end">
  <NeuButton
    variant="secondary"
    onClick={onCancel}
  >
    Cancelar
  </NeuButton>

  <NeuButton
    variant="soft"
    loading={isSaving}
    disabled={!isValid || isSaving}
    onClick={handleSubmit}
    icon={<Icon3D name="check" />}
    iconPosition="left"
  >
    Salvar
  </NeuButton>
</div>

AÇÃO DESTRUTIVA:
<NeuButton
  variant="danger"
  icon={<Icon3D name="trash" />}
  confirmDialog={{
    title: "Deletar conta",
    message: "Esta ação não pode ser desfeita",
  }}
  onClick={handleDelete}
  aria-label="Deletar conta permanentemente"
>
  Deletar Conta
</NeuButton>

NAVEGAÇÃO:
<NeuButton
  variant="soft"
  size="lg"
  icon={<Icon3D name="arrow-right" />}
  iconPosition="right"
  onClick={() => router.push('/dashboard')}
>
  Ir para Dashboard
</NeuButton>

─────────────────────────────────────────────────

8️⃣ CHECKLIST FINAL

Antes de usar NeuButton, verifique:
☐ Variant apropriado ao contexto
☐ aria-label se houver apenas ícone
☐ loading={true} em ações async
☐ disabled durante loading
☐ Icon3D (não lucide)
☐ confirmDialog em ações destrutivas
☐ Size apropriado ao contexto
☐ onClick com handler tipado

═══════════════════════════════════════════════

🎯 SEGUIR ESTES PADRÕES = CÓDIGO PERFEITO 1ª VEZ!
    `,
  }
);
