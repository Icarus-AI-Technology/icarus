import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useSupabase } from '@/hooks/useSupabase'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

interface ContactFormData {
  nome_completo: string
  email: string
  telefone: string
  empresa: string
  cargo: string
  tamanho_empresa: string
  segmento: string
  principal_desafio: string
  interesse_em: string[]
  como_conheceu: string
  mensagem: string
}

export function ContactForm() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ContactFormData>({
    nome_completo: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    tamanho_empresa: '',
    segmento: '',
    principal_desafio: '',
    interesse_em: [],
    como_conheceu: '',
    mensagem: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Save to Supabase
      const { error: dbError } = await supabase.from('leads').insert([
        {
          ...formData,
          origem: 'site',
          status: 'novo',
        },
      ])

      if (dbError) throw dbError

      // Send email via Supabase Edge Function
      try {
        await supabase.functions.invoke('send-lead-email', {
          body: formData,
        })
      } catch (emailError) {
        // Log error but don't fail the form submission
        console.error('Failed to send email notification:', emailError)
      }
      
      setSuccess(true)
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        empresa: '',
        cargo: '',
        tamanho_empresa: '',
        segmento: '',
        principal_desafio: '',
        interesse_em: [],
        como_conheceu: '',
        mensagem: '',
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Erro ao enviar formulário. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interesse_em: prev.interesse_em.includes(interest)
        ? prev.interesse_em.filter((i) => i !== interest)
        : [...prev.interesse_em, interest],
    }))
  }

  const interests = [
    'IA e Automação',
    'Gestão de Estoque',
    'Controle Financeiro',
    'Gestão de Cirurgias',
    'Análise de Dados',
    'Integração com Hospitais',
  ]

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Mensagem enviada com sucesso!
        </h3>
        <p className="text-gray-600 mb-8">
          Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
        </p>
        <Button onClick={() => setSuccess(false)}>Enviar outra mensagem</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="nome_completo">
            Nome Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nome_completo"
            type="text"
            placeholder="Seu nome completo"
            value={formData.nome_completo}
            onChange={(e) =>
              setFormData({ ...formData, nome_completo: e.target.value })
            }
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Corporativo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@empresa.com.br"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone">
            Telefone/WhatsApp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            required
          />
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <Label htmlFor="empresa">
            Empresa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="empresa"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            required
          />
        </div>

        {/* Cargo */}
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            type="text"
            placeholder="Seu cargo na empresa"
            value={formData.cargo}
            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
          />
        </div>

        {/* Tamanho da Empresa */}
        <div className="space-y-2">
          <Label htmlFor="tamanho_empresa">Tamanho da Empresa</Label>
          <select
            id="tamanho_empresa"
            value={formData.tamanho_empresa}
            onChange={(e) =>
              setFormData({ ...formData, tamanho_empresa: e.target.value })
            }
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Selecione</option>
            <option value="pequena">Pequena (1-50 funcionários)</option>
            <option value="media">Média (51-250 funcionários)</option>
            <option value="grande">Grande (250+ funcionários)</option>
          </select>
        </div>

        {/* Segmento */}
        <div className="space-y-2">
          <Label htmlFor="segmento">Segmento</Label>
          <select
            id="segmento"
            value={formData.segmento}
            onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Selecione</option>
            <option value="opme">OPME</option>
            <option value="hospitalar">Hospitalar</option>
            <option value="clinica">Clínica</option>
            <option value="distribuidora">Distribuidora Médica</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Principal Desafio */}
      <div className="space-y-2">
        <Label htmlFor="principal_desafio">
          Qual o seu principal desafio na gestão hoje?
        </Label>
        <Textarea
          id="principal_desafio"
          placeholder="Descreva brevemente o principal desafio que você enfrenta..."
          value={formData.principal_desafio}
          onChange={(e) =>
            setFormData({ ...formData, principal_desafio: e.target.value })
          }
          rows={3}
        />
      </div>

      {/* Interesses */}
      <div className="space-y-3">
        <Label>Áreas de Interesse</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((interest) => (
            <label
              key={interest}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.interesse_em.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Como Conheceu */}
      <div className="space-y-2">
        <Label htmlFor="como_conheceu">Como conheceu o Icarus?</Label>
        <select
          id="como_conheceu"
          value={formData.como_conheceu}
          onChange={(e) =>
            setFormData({ ...formData, como_conheceu: e.target.value })
          }
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Selecione</option>
          <option value="google">Google</option>
          <option value="indicacao">Indicação</option>
          <option value="linkedin">LinkedIn</option>
          <option value="instagram">Instagram</option>
          <option value="evento">Evento</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* Mensagem */}
      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem adicional</Label>
        <Textarea
          id="mensagem"
          placeholder="Deixe aqui qualquer informação adicional que julgar relevante..."
          value={formData.mensagem}
          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Enviar Contato
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-gray-500">
        Ao enviar este formulário, você concorda com nossa política de privacidade.
        Seus dados serão utilizados apenas para contato comercial.
      </p>
    </form>
  )
}

