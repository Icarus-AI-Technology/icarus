import { useState } from 'react'
import { NeuButton } from '@/components/ui/neu-button'
import { NeuCard } from '@/components/ui/neu-card'
import { NeuInput } from '@/components/ui/neu-input'
import { Icon3D } from '@/components/ui/icon-3d'

/**
 * Página de Showcase - Demonstração de todos os componentes ICARUS
 *
 * Use esta página como referência visual e para testar componentes
 */
export default function ShowcasePage() {
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const handleAsyncAction = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  const validateInput = (value: string) => {
    if (value.length < 3) {
      setInputError('Mínimo 3 caracteres')
    } else {
      setInputError('')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ICARUS v5.0 Showcase
          </h1>
          <p className="text-muted-foreground">
            Demonstração interativa de todos os componentes Neumorphism
          </p>
        </div>

        {/* Buttons Section */}
        <NeuCard variant="soft" elevation="medium" padding="lg">
          <h2 className="text-2xl font-bold mb-6">NeuButton - Variantes</h2>

          <div className="space-y-8">
            {/* Primary Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Ações Principais</h3>
              <div className="flex flex-wrap gap-4">
                <NeuButton variant="primary" size="sm">
                  Small Primary
                </NeuButton>
                <NeuButton variant="primary" size="md">
                  Medium Primary
                </NeuButton>
                <NeuButton variant="primary" size="lg">
                  Large Primary
                </NeuButton>
                <NeuButton variant="primary" size="xl">
                  XLarge Primary
                </NeuButton>
              </div>
            </div>

            {/* Soft Variant */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Neumorphic Soft</h3>
              <div className="flex flex-wrap gap-4">
                <NeuButton variant="soft">
                  Soft Default
                </NeuButton>
                <NeuButton
                  variant="soft"
                  icon={<Icon3D name="save" />}
                  iconPosition="left"
                >
                  Com Ícone Esquerda
                </NeuButton>
                <NeuButton
                  variant="soft"
                  icon={<Icon3D name="arrow-right" />}
                  iconPosition="right"
                >
                  Com Ícone Direita
                </NeuButton>
                <NeuButton variant="soft" disabled>
                  Desabilitado
                </NeuButton>
              </div>
            </div>

            {/* Loading States */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Estados de Loading</h3>
              <div className="flex flex-wrap gap-4">
                <NeuButton
                  variant="soft"
                  loading={loading}
                  onClick={handleAsyncAction}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </NeuButton>
                <NeuButton variant="primary" loading={true}>
                  Loading Primary
                </NeuButton>
                <NeuButton variant="secondary" loading={true}>
                  Loading Secondary
                </NeuButton>
              </div>
            </div>

            {/* Danger Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Ações Destrutivas</h3>
              <div className="flex flex-wrap gap-4">
                <NeuButton
                  variant="danger"
                  icon={<Icon3D name="trash" />}
                >
                  Deletar
                </NeuButton>
                <NeuButton variant="danger" size="sm">
                  Cancelar
                </NeuButton>
              </div>
            </div>

            {/* Secondary & Pressed */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Secundárias e Pressionadas</h3>
              <div className="flex flex-wrap gap-4">
                <NeuButton variant="secondary">
                  Secundário
                </NeuButton>
                <NeuButton variant="pressed">
                  Estado Pressionado
                </NeuButton>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Cards Section */}
        <NeuCard variant="soft" elevation="medium" padding="lg">
          <h2 className="text-2xl font-bold mb-6">NeuCard - Elevações e Variantes</h2>

          <div className="space-y-6">
            {/* Elevations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Níveis de Elevação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NeuCard variant="soft" elevation="low" padding="md">
                  <h4 className="font-semibold mb-2">Elevação Baixa</h4>
                  <p className="text-sm text-muted-foreground">
                    Para elementos secundários e footers
                  </p>
                </NeuCard>

                <NeuCard variant="soft" elevation="medium" padding="md">
                  <h4 className="font-semibold mb-2">Elevação Média</h4>
                  <p className="text-sm text-muted-foreground">
                    Padrão - 80% dos casos de uso
                  </p>
                </NeuCard>

                <NeuCard variant="soft" elevation="high" padding="md">
                  <h4 className="font-semibold mb-2">Elevação Alta</h4>
                  <p className="text-sm text-muted-foreground">
                    Modais, popovers, elementos principais
                  </p>
                </NeuCard>
              </div>
            </div>

            {/* Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Variantes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NeuCard variant="soft" padding="md">
                  <h4 className="font-semibold mb-2">Soft (Padrão)</h4>
                  <p className="text-sm text-muted-foreground">
                    Sombras externas, aparece elevado
                  </p>
                </NeuCard>

                <NeuCard variant="pressed" padding="md">
                  <h4 className="font-semibold mb-2">Pressed</h4>
                  <p className="text-sm text-muted-foreground">
                    Sombras internas, aparece afundado
                  </p>
                </NeuCard>

                <NeuCard variant="flat" padding="md">
                  <h4 className="font-semibold mb-2">Flat</h4>
                  <p className="text-sm text-muted-foreground">
                    Sem sombras, apenas border
                  </p>
                </NeuCard>
              </div>
            </div>

            {/* Padding Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Opções de Padding</h3>
              <div className="space-y-4">
                <NeuCard variant="soft" padding="sm">
                  <p className="text-sm">Padding Small (sm)</p>
                </NeuCard>
                <NeuCard variant="soft" padding="md">
                  <p className="text-sm">Padding Medium (md) - Padrão</p>
                </NeuCard>
                <NeuCard variant="soft" padding="lg">
                  <p className="text-sm">Padding Large (lg)</p>
                </NeuCard>
                <NeuCard variant="soft" padding="xl">
                  <p className="text-sm">Padding XLarge (xl)</p>
                </NeuCard>
              </div>
            </div>

            {/* Card com Ícone 3D */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Card com Ícone 3D</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NeuCard variant="soft" elevation="medium" padding="lg">
                  <div className="flex items-center gap-4">
                    <Icon3D name="wallet" size="lg" />
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className="text-xl font-bold">R$ 125.430</p>
                    </div>
                  </div>
                </NeuCard>

                <NeuCard variant="soft" elevation="medium" padding="lg">
                  <div className="flex items-center gap-4">
                    <Icon3D name="package" size="lg" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque</p>
                      <p className="text-xl font-bold">1.234</p>
                    </div>
                  </div>
                </NeuCard>

                <NeuCard variant="soft" elevation="medium" padding="lg">
                  <div className="flex items-center gap-4">
                    <Icon3D name="users" size="lg" />
                    <div>
                      <p className="text-sm text-muted-foreground">Clientes</p>
                      <p className="text-xl font-bold">456</p>
                    </div>
                  </div>
                </NeuCard>

                <NeuCard variant="soft" elevation="medium" padding="lg">
                  <div className="flex items-center gap-4">
                    <Icon3D name="chart" size="lg" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vendas</p>
                      <p className="text-xl font-bold">R$ 89.500</p>
                    </div>
                  </div>
                </NeuCard>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Inputs Section */}
        <NeuCard variant="soft" elevation="medium" padding="lg">
          <h2 className="text-2xl font-bold mb-6">NeuInput - Campos de Entrada</h2>

          <div className="space-y-6 max-w-2xl">
            {/* Basic Input */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Input Básico</h3>
              <NeuInput
                label="Nome do Produto"
                placeholder="Ex: Prótese de Joelho"
                type="text"
              />
            </div>

            {/* Input with Helper Text */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Input com Helper Text</h3>
              <NeuInput
                label="Código"
                placeholder="PRO-001"
                helperText="Formato: PRO-XXX (3 letras + hífen + 3 números)"
              />
            </div>

            {/* Input with Validation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Input com Validação</h3>
              <NeuInput
                label="Nome"
                placeholder="Digite seu nome"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  validateInput(e.target.value)
                }}
                error={inputError}
                helperText={!inputError ? "Mínimo 3 caracteres" : undefined}
              />
            </div>

            {/* Disabled Input */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Input Desabilitado</h3>
              <NeuInput
                label="Campo Desabilitado"
                placeholder="Não editável"
                disabled
                value="Valor fixo"
              />
            </div>

            {/* Different Types */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Tipos de Input</h3>
              <div className="space-y-4">
                <NeuInput
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                />
                <NeuInput
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                />
                <NeuInput
                  label="Número"
                  type="number"
                  placeholder="0"
                />
                <NeuInput
                  label="Data"
                  type="date"
                />
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Form Example */}
        <NeuCard variant="soft" elevation="high" padding="xl">
          <h2 className="text-2xl font-bold mb-6">Exemplo: Formulário Completo</h2>

          <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuInput
                label="Nome do Produto *"
                placeholder="Ex: Prótese de Joelho"
                required
              />
              <NeuInput
                label="Código *"
                placeholder="PRO-001"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuInput
                label="Preço *"
                type="number"
                placeholder="0,00"
                required
              />
              <NeuInput
                label="Estoque"
                type="number"
                placeholder="0"
              />
            </div>

            <NeuInput
              label="Descrição"
              placeholder="Descrição detalhada do produto..."
            />

            <div className="flex gap-4 justify-end pt-4">
              <NeuButton variant="secondary" type="button">
                Cancelar
              </NeuButton>
              <NeuButton
                variant="soft"
                type="submit"
                icon={<Icon3D name="check" />}
                iconPosition="left"
              >
                Salvar Produto
              </NeuButton>
            </div>
          </form>
        </NeuCard>

        {/* Usage Guide */}
        <NeuCard variant="soft" elevation="medium" padding="lg">
          <h2 className="text-2xl font-bold mb-4">📖 Guia de Uso</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>NeuButton:</strong> Use variant="soft" para ações principais,
              "danger" para destrutivas, "secondary" para cancelar.
            </p>
            <p>
              <strong>NeuCard:</strong> elevation="medium" é o padrão.
              Use "high" para modais e elementos importantes.
            </p>
            <p>
              <strong>NeuInput:</strong> Sempre inclua label.
              Use helperText para instruções e error para validações.
            </p>
            <p>
              <strong>Icon3D:</strong> Preferível a ícones planos.
              Adiciona profundidade ao design neumórfico.
            </p>
          </div>
        </NeuCard>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm py-8">
          <p>ICARUS v5.0 - Design System Neumorphism</p>
          <p className="mt-2">
            Desenvolvido com ❤️ usando Code Connect + Claude Code
          </p>
        </div>
      </div>
    </div>
  )
}
