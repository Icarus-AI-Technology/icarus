/**
 * Contact Page - ICARUS v5.0
 * 
 * Formulário de contato com:
 * - OraclusX DS Components (100% neuromórfico)
 * - Validação Zod
 * - API integration POST /api/contact
 * - Toast notifications
 */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Send, Mail, Phone, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { contactSchema, submitContact, type ContactFormData } from '@/lib/api/contact'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      // Enviar via API service
      const response = await submitContact(data)

      if (response.success) {
        // Feedback de sucesso
        toast.success(response.message, {
          description: 'Entraremos em contato em breve.',
          icon: <CheckCircle className="size-5 text-green-500" />,
        })

        // Limpar formulário
        reset()
      } else {
        // Erro retornado pela API
        toast.error('Erro ao enviar mensagem', {
          description: response.message,
          icon: <AlertCircle className="size-5 text-red-500" />,
        })
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem', {
        description: 'Por favor, tente novamente mais tarde.',
        icon: <AlertCircle className="size-5 text-red-500" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 'var(--font-bold)' }} className="text-gray-900 dark:text-gray-100 mb-4">
            Entre em Contato
          </h1>
          <p style={{ fontSize: 'var(--font-lg)' }} className="text-gray-600 dark:text-gray-400">
            Preencha o formulário abaixo e entraremos em contato em breve
          </p>
        </div>

        {/* Card Neuromórfico */}
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader>
              <CardTitle>Formulário de Contato</CardTitle>
              <CardDescription>
                Todos os campos marcados com * são obrigatórios
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Nome */}
              <div className="relative">
                <div className="absolute left-3 top-11 text-gray-400">
                  <User className="size-5" />
                </div>
                <Input
                  {...register('nome')}
                  label="Nome completo *"
                  placeholder="Digite seu nome completo"
                  error={errors.nome?.message}
                  className="pl-12"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-3 top-11 text-gray-400">
                  <Mail className="size-5" />
                </div>
                <Input
                  {...register('email')}
                  type="email"
                  label="Email *"
                  placeholder="seu.email@exemplo.com"
                  error={errors.email?.message}
                  className="pl-12"
                  disabled={isSubmitting}
                />
              </div>

              {/* Telefone */}
              <div className="relative">
                <div className="absolute left-3 top-11 text-gray-400">
                  <Phone className="size-5" />
                </div>
                <Input
                  {...register('telefone')}
                  type="tel"
                  label="Telefone"
                  placeholder="(11) 98765-4321"
                  error={errors.telefone?.message}
                  helperText="Formato: (11) 98765-4321"
                  className="pl-12"
                  disabled={isSubmitting}
                />
              </div>

              {/* Mensagem */}
              <div className="relative">
                <div className="absolute left-3 top-11 text-gray-400">
                  <MessageSquare className="size-5" />
                </div>
                <Textarea
                  {...register('mensagem')}
                  label="Mensagem *"
                  placeholder="Digite sua mensagem aqui..."
                  error={errors.mensagem?.message}
                  helperText={`Mínimo 10 caracteres`}
                  className="pl-12"
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Limpar
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Informações de contato adicionais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="bordered" padding="md" className="text-center">
            <Mail className="size-8 text-[#6366F1] mx-auto mb-3" />
            <h3 style={{ fontWeight: 'var(--font-semibold)' }} className="text-gray-900 dark:text-gray-100 mb-1">
              Email
            </h3>
            <p style={{ fontSize: 'var(--font-sm)' }} className="text-gray-600 dark:text-gray-400">
              contato@icarus.ai
            </p>
          </Card>

          <Card variant="bordered" padding="md" className="text-center">
            <Phone className="size-8 text-[#6366F1] mx-auto mb-3" />
            <h3 style={{ fontWeight: 'var(--font-semibold)' }} className="text-gray-900 dark:text-gray-100 mb-1">
              Telefone
            </h3>
            <p style={{ fontSize: 'var(--font-sm)' }} className="text-gray-600 dark:text-gray-400">
              (11) 98765-4321
            </p>
          </Card>

          <Card variant="bordered" padding="md" className="text-center">
            <MessageSquare className="size-8 text-[#6366F1] mx-auto mb-3" />
            <h3 style={{ fontWeight: 'var(--font-semibold)' }} className="text-gray-900 dark:text-gray-100 mb-1">
              WhatsApp
            </h3>
            <p style={{ fontSize: 'var(--font-sm)' }} className="text-gray-600 dark:text-gray-400">
              (11) 98765-4321
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

