import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
      const { error: dbError } = await supabase.from('leads').insert([
        {
          ...formData,
          origem: 'site',
          status: 'novo',
        },
      ])

      if (dbError) throw dbError

      try {
        await supabase.functions.invoke('send-lead-email', {
          body: formData,
        })
      } catch (emailError) {
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
        <h3 className="text-gray-900 mb-4" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
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
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800" style={{ fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="nome_completo">Nome Completo <span className="text-red-500">*</span></Label>
          <Input
            id="nome_completo"
            type="text"
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone <span className="text-red-500">*</span></Label>
          <Input
            id="telefone"
            type="tel"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa <span className="text-red-500">*</span></Label>
          <Input
            id="empresa"
            type="text"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            type="text"
            value={formData.cargo}
            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Áreas de Interesse</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((interest) => (
            <label
              key={interest}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.interesse_em.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="w-4 h-4"
              />
              <span className="text-gray-700" style={{ fontSize: '0.875rem' }}>{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea
          id="mensagem"
          value={formData.mensagem}
          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button type="submit" disabled={loading} size="lg" className="min-w-[200px]">
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
    </form>
  )
}

