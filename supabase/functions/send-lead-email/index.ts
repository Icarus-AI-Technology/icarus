// Supabase Edge Function para envio de emails de leads
// Deploy: npx supabase functions deploy send-lead-email

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RECIPIENT_EMAIL = 'dax@newortho.com.br'

interface Lead {
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const lead: Lead = await req.json()

    // Format email HTML
    const emailHtml = `
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚀 Novo Lead - Icarus v5.0</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Formulário de contato do site</p>
          </div>
          
          <div class="content">
            <div class="urgency">
              <div class="urgency-title">⚡ Lead Quente - Ação Recomendada</div>
              <div style="color: #991B1B; font-size: 14px;">
                Responda dentro de 24 horas para maximizar a conversão
              </div>
            </div>

            <div class="field">
              <div class="field-label">Nome Completo</div>
              <div class="field-value">${lead.nome_completo}</div>
            </div>

            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">
                <a href="mailto:${lead.email}" style="color: #4F46E5; text-decoration: none;">${lead.email}</a>
              </div>
            </div>

            <div class="field">
              <div class="field-label">Telefone/WhatsApp</div>
              <div class="field-value">
                <a href="https://wa.me/${lead.telefone.replace(/\D/g, '')}" style="color: #4F46E5; text-decoration: none;">
                  ${lead.telefone}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="field-label">Empresa</div>
              <div class="field-value">${lead.empresa}</div>
            </div>

            ${
              lead.cargo
                ? `
            <div class="field">
              <div class="field-label">Cargo</div>
              <div class="field-value">${lead.cargo}</div>
            </div>
            `
                : ''
            }

            ${
              lead.tamanho_empresa
                ? `
            <div class="field">
              <div class="field-label">Tamanho da Empresa</div>
              <div class="field-value">${lead.tamanho_empresa}</div>
            </div>
            `
                : ''
            }

            ${
              lead.segmento
                ? `
            <div class="field">
              <div class="field-label">Segmento</div>
              <div class="field-value">${lead.segmento}</div>
            </div>
            `
                : ''
            }

            ${
              lead.principal_desafio
                ? `
            <div class="field">
              <div class="field-label">Principal Desafio</div>
              <div class="field-value">${lead.principal_desafio}</div>
            </div>
            `
                : ''
            }

            ${
              lead.interesse_em && lead.interesse_em.length > 0
                ? `
            <div class="field">
              <div class="field-label">Áreas de Interesse</div>
              <div class="tags">
                ${lead.interesse_em.map((interesse) => `<span class="tag">${interesse}</span>`).join('')}
              </div>
            </div>
            `
                : ''
            }

            ${
              lead.como_conheceu
                ? `
            <div class="field">
              <div class="field-label">Como Conheceu</div>
              <div class="field-value">${lead.como_conheceu}</div>
            </div>
            `
                : ''
            }

            ${
              lead.mensagem
                ? `
            <div class="field">
              <div class="field-label">Mensagem Adicional</div>
              <div class="field-value">${lead.mensagem}</div>
            </div>
            `
                : ''
            }

            <div class="footer">
              <strong>Icarus v5.0</strong> - Gestão elevada pela IA<br>
              © 2025 IcarusAI Technology
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Icarus v5.0 <leads@icarus.com>',
        to: [RECIPIENT_EMAIL],
        subject: `🚀 Novo Lead: ${lead.empresa} - ${lead.nome_completo}`,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await resendResponse.json()

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})

