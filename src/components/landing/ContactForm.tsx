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
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#10B981]/20 mb-6 neu-elevated">
          <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Mensagem enviada com sucesso!
        </h3>
        <p className="text-[#94A3B8] mb-8">
          Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
        </p>
        <Button onClick={() => setSuccess(false)} className="btn-gradient">Enviar outra mensagem</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#EF4444]/10 rounded-xl neu-pressed">
          <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="nome_completo" className="text-white">
            Nome Completo <span className="text-[#EF4444]">*</span>
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
            className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Corporativo <span className="text-[#EF4444]">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@empresa.com.br"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-white">
            Telefone/WhatsApp <span className="text-[#EF4444]">*</span>
          </Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            required
            className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
          />
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <Label htmlFor="empresa" className="text-white">
            Empresa <span className="text-[#EF4444]">*</span>
          </Label>
          <Input
            id="empresa"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            required
            className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
          />
        </div>

        {/* Cargo */}
        <div className="space-y-2">
          <Label htmlFor="cargo" className="text-white">Cargo</Label>
          <Input
            id="cargo"
            type="text"
            placeholder="Seu cargo na empresa"
            value={formData.cargo}
            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
          />
        </div>

        {/* Tamanho da Empresa */}
        <div className="space-y-2">
          <Label htmlFor="tamanho_empresa" className="text-white">Tamanho da Empresa</Label>
          <div className="relative">
            <select
              id="tamanho_empresa"
              aria-label="Tamanho da Empresa"
              value={formData.tamanho_empresa}
              onChange={(e) =>
                setFormData({ ...formData, tamanho_empresa: e.target.value })
              }
              className="w-full h-12 rounded-xl bg-[#1A1F35] text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 neu-pressed appearance-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-[#1A1F35] text-[#94A3B8]">Selecione</option>
              <option value="pequena" className="bg-[#1A1F35] text-white">Pequena (1-50 funcionários)</option>
              <option value="media" className="bg-[#1A1F35] text-white">Média (51-250 funcionários)</option>
              <option value="grande" className="bg-[#1A1F35] text-white">Grande (250+ funcionários)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Segmento */}
        <div className="space-y-2">
          <Label htmlFor="segmento" className="text-white">Segmento</Label>
          <div className="relative">
            <select
              id="segmento"
              aria-label="Segmento"
              value={formData.segmento}
              onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
              className="w-full h-12 rounded-xl bg-[#1A1F35] text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 neu-pressed appearance-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-[#1A1F35] text-[#94A3B8]">Selecione</option>
              <option value="opme" className="bg-[#1A1F35] text-white">OPME</option>
              <option value="hospitalar" className="bg-[#1A1F35] text-white">Hospitalar</option>
              <option value="clinica" className="bg-[#1A1F35] text-white">Clínica</option>
              <option value="distribuidora" className="bg-[#1A1F35] text-white">Distribuidora Médica</option>
              <option value="outros" className="bg-[#1A1F35] text-white">Outros</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Principal Desafio */}
      <div className="space-y-2">
        <Label htmlFor="principal_desafio" className="text-white">
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
          className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
        />
      </div>

      {/* Interesses */}
      <div className="space-y-3">
        <Label className="text-white">Áreas de Interesse</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((interest) => {
            const isChecked = formData.interesse_em.includes(interest)
            return (
              <label
                key={interest}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 neu-card ${
                  isChecked 
                    ? 'bg-[#1A1F35] ring-2 ring-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'bg-[#15192B] hover:bg-[#1A1F35]'
                }`}
              >
                {/* Custom Checkbox com efeito forte */}
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isChecked 
                      ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[0_0_12px_rgba(99,102,241,0.5)]' 
                      : 'bg-[#1A1F35] border-2 border-[#4B5563] hover:border-[#6366F1]'
                  }`}
                  style={{
                    boxShadow: isChecked 
                      ? '0 0 12px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)' 
                      : 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05)'
                  }}
                >
                  {isChecked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleInterestToggle(interest)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-white' : 'text-[#94A3B8]'}`}>
                  {interest}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Como Conheceu */}
      <div className="space-y-2">
        <Label htmlFor="como_conheceu" className="text-white">Como conheceu o Icarus?</Label>
        <div className="relative">
          <select
            id="como_conheceu"
            aria-label="Como conheceu o Icarus?"
            value={formData.como_conheceu}
            onChange={(e) =>
              setFormData({ ...formData, como_conheceu: e.target.value })
            }
            className="w-full h-12 rounded-xl bg-[#1A1F35] text-white px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 neu-pressed appearance-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-[#1A1F35] text-[#94A3B8]">Selecione</option>
            <option value="google" className="bg-[#1A1F35] text-white">Google</option>
            <option value="indicacao" className="bg-[#1A1F35] text-white">Indicação</option>
            <option value="linkedin" className="bg-[#1A1F35] text-white">LinkedIn</option>
            <option value="instagram" className="bg-[#1A1F35] text-white">Instagram</option>
            <option value="evento" className="bg-[#1A1F35] text-white">Evento</option>
            <option value="outros" className="bg-[#1A1F35] text-white">Outros</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      <div className="space-y-2">
        <Label htmlFor="mensagem" className="text-white">Mensagem adicional</Label>
        <Textarea
          id="mensagem"
          placeholder="Deixe aqui qualquer informação adicional que julgar relevante..."
          value={formData.mensagem}
          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
          rows={4}
          className="bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="min-w-[200px] btn-gradient"
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
      <p className="text-xs text-center text-[#64748B]">
        Ao enviar este formulário, você concorda com nossa política de privacidade.
        Seus dados serão utilizados apenas para contato comercial.
      </p>
    </form>
  )
}
