// Supabase Edge Function para envio de emails de leads
// Deploy: npx supabase functions deploy send-lead-email
// Updated: 2025-11-25 - Security fixes applied
// NOTE: This is a PUBLIC endpoint for lead capture (no auth required)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Import shared utilities
import { getCorsHeaders, handleCorsPreflightRequest, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { escapeHtml } from '../_shared/validation.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RECIPIENT_EMAIL = Deno.env.get('LEAD_RECIPIENT_EMAIL') || 'sac@icarusai.com.br'

// Rate limiting by IP (public endpoint, more restrictive)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = { windowMs: 3600000, maxRequests: 5 } // 5 requests per hour per IP

// Zod Schema for input validation
const LeadSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  email: z.string().email('Email invalido').max(254),
  telefone: z.string().min(8, 'Telefone invalido').max(20),
  empresa: z.string().min(1, 'Empresa e obrigatoria').max(200),
  cargo: z.string().max(100).optional(),
  tamanho_empresa: z.string().max(50).optional(),
  segmento: z.string().max(100).optional(),
  principal_desafio: z.string().max(500).optional(),
  interesse_em: z.array(z.string().max(100)).max(10).optional(),
  como_conheceu: z.string().max(100).optional(),
  mensagem: z.string().max(2000).optional(),
})

type Lead = z.infer<typeof LeadSchema>

/**
 * Check rate limit by IP (for public endpoints)
 */
function checkRateLimitByIP(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || record.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return true
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Get client IP from request
 */
function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

serve(async (req) => {
  const requestId = crypto.randomUUID()

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req)
  }

  try {
    // 1. Rate limit by IP (no auth for lead capture)
    const clientIP = getClientIP(req)
    if (!checkRateLimitByIP(clientIP)) {
      console.warn('Rate limit exceeded:', { requestId, ip: clientIP })
      return new Response(
        JSON.stringify({
          error: 'Muitas solicitacoes. Tente novamente mais tarde.',
          requestId,
        }),
        {
          status: 429,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        }
      )
    }

    // 2. Parse and validate input
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('JSON invalido', req, 400, requestId)
    }

    const parseResult = LeadSchema.safeParse(body)
    if (!parseResult.success) {
      console.warn('Validation error:', { requestId, errors: parseResult.error.errors })
      return new Response(
        JSON.stringify({
          error: 'Erro de validacao',
          details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
          requestId,
        }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        }
      )
    }

    const lead = parseResult.data

    // 3. Check if Resend API is configured
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured')
      // In development, just log and return success
      console.log('Lead received (dev mode):', {
        nome: lead.nome_completo,
        email: lead.email,
        empresa: lead.empresa,
      })
      return jsonResponse({ success: true, id: requestId, mode: 'development' }, req, 200)
    }

    // 4. Format email HTML with XSS protection
    const emailHtml = generateEmailHtml(lead)

    // 5. Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Icarus v5.0 <leads@icarus.com>',
        to: [RECIPIENT_EMAIL],
        subject: `Novo Lead: ${escapeHtml(lead.empresa)} - ${escapeHtml(lead.nome_completo)}`,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('Resend API error:', { requestId, status: resendResponse.status, error: errorText })
      throw new Error('Falha ao enviar email')
    }

    const result = await resendResponse.json()

    return jsonResponse({ success: true, id: result.id }, req, 200)

  } catch (error) {
    console.error('Unhandled error:', {
      requestId,
      error: error instanceof Error ? { name: error.name, message: error.message } : 'unknown',
    })

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar solicitacao',
        requestId,
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Generate email HTML with XSS protection
 */
function generateEmailHtml(lead: Lead): string {
  // Escape all user input to prevent XSS
  const safe = {
    nome_completo: escapeHtml(lead.nome_completo),
    email: escapeHtml(lead.email),
    telefone: escapeHtml(lead.telefone),
    empresa: escapeHtml(lead.empresa),
    cargo: lead.cargo ? escapeHtml(lead.cargo) : '',
    tamanho_empresa: lead.tamanho_empresa ? escapeHtml(lead.tamanho_empresa) : '',
    segmento: lead.segmento ? escapeHtml(lead.segmento) : '',
    principal_desafio: lead.principal_desafio ? escapeHtml(lead.principal_desafio) : '',
    interesse_em: lead.interesse_em?.map(escapeHtml) || [],
    como_conheceu: lead.como_conheceu ? escapeHtml(lead.como_conheceu) : '',
    mensagem: lead.mensagem ? escapeHtml(lead.mensagem) : '',
  }

  // Clean phone for WhatsApp link
  const cleanPhone = lead.telefone.replace(/\D/g, '')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novo Lead - Icarus v5.0</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .field {
            margin-bottom: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #6366F1;
          }
          .field-label {
            font-weight: 600;
            color: #4F46E5;
            margin-bottom: 5px;
            font-size: 14px;
            text-transform: uppercase;
          }
          .field-value {
            color: #1F2937;
            font-size: 16px;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }
          .tag {
            background: #EEF2FF;
            color: #4F46E5;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          }
          .urgency {
            background: #FEF2F2;
            border-left-color: #EF4444;
            border-left-width: 4px;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .urgency-title {
            color: #DC2626;
            font-weight: 600;
            margin-bottom: 5px;
          }
          a { color: #4F46E5; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Novo Lead - Icarus v5.0</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Formulario de contato do site</p>
        </div>

        <div class="content">
          <div class="urgency">
            <div class="urgency-title">Lead Quente - Acao Recomendada</div>
            <div style="color: #991B1B; font-size: 14px;">
              Responda dentro de 24 horas para maximizar a conversao
            </div>
          </div>

          <div class="field">
            <div class="field-label">Nome Completo</div>
            <div class="field-value">${safe.nome_completo}</div>
          </div>

          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
              <a href="mailto:${safe.email}">${safe.email}</a>
            </div>
          </div>

          <div class="field">
            <div class="field-label">Telefone/WhatsApp</div>
            <div class="field-value">
              <a href="https://wa.me/${cleanPhone}">${safe.telefone}</a>
            </div>
          </div>

          <div class="field">
            <div class="field-label">Empresa</div>
            <div class="field-value">${safe.empresa}</div>
          </div>

          ${safe.cargo ? `
          <div class="field">
            <div class="field-label">Cargo</div>
            <div class="field-value">${safe.cargo}</div>
          </div>
          ` : ''}

          ${safe.tamanho_empresa ? `
          <div class="field">
            <div class="field-label">Tamanho da Empresa</div>
            <div class="field-value">${safe.tamanho_empresa}</div>
          </div>
          ` : ''}

          ${safe.segmento ? `
          <div class="field">
            <div class="field-label">Segmento</div>
            <div class="field-value">${safe.segmento}</div>
          </div>
          ` : ''}

          ${safe.principal_desafio ? `
          <div class="field">
            <div class="field-label">Principal Desafio</div>
            <div class="field-value">${safe.principal_desafio}</div>
          </div>
          ` : ''}

          ${safe.interesse_em.length > 0 ? `
          <div class="field">
            <div class="field-label">Areas de Interesse</div>
            <div class="tags">
              ${safe.interesse_em.map(interesse => `<span class="tag">${interesse}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${safe.como_conheceu ? `
          <div class="field">
            <div class="field-label">Como Conheceu</div>
            <div class="field-value">${safe.como_conheceu}</div>
          </div>
          ` : ''}

          ${safe.mensagem ? `
          <div class="field">
            <div class="field-label">Mensagem Adicional</div>
            <div class="field-value">${safe.mensagem}</div>
          </div>
          ` : ''}

          <div class="footer">
            <strong>Icarus v5.0</strong> - Gestao elevada pela IA<br>
            2025 IcarusAI Technology
          </div>
        </div>
      </body>
    </html>
  `
}
