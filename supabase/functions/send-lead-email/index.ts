// Supabase Edge Function to send email notification when a new lead is created
// Deploy with: supabase functions deploy send-lead-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface LeadData {
  leadId: string
  nome: string
  empresa: string
  email: string
  telefone: string
  cargo: string
  numeroColaboradores: string
  principalDesafio: string
  interesseIA: string
  mensagem?: string
}

serve(async (req) => {
  // Handle CORS preflight
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
    const leadData: LeadData = await req.json()
    
    // Validate required fields
    if (!leadData.nome || !leadData.email || !leadData.empresa) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Send email notification using Resend
    // Note: You'll need to configure RESEND_API_KEY in Supabase Edge Function secrets
    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Icarus v5.0 <leads@newortho.com.br>',
          to: ['dax@newortho.com.br'],
          subject: `🎯 Novo Lead: ${leadData.nome} - ${leadData.empresa}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
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
                    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 28px;
                  }
                  .content {
                    background: #fff;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 10px 10px;
                  }
                  .field {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f3f4f6;
                  }
                  .field:last-child {
                    border-bottom: none;
                  }
                  .label {
                    font-weight: 600;
                    color: #6366F1;
                    margin-bottom: 5px;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .value {
                    font-size: 16px;
                    color: #1f2937;
                  }
                  .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: #6366F1;
                    color: white;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                  }
                  .cta-button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🎯 Novo Lead Capturado</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Icarus v5.0 Landing Page</p>
                </div>
                
                <div class="content">
                  <p><span class="badge">🆕 Novo</span></p>
                  
                  <div class="field">
                    <div class="label">Nome Completo</div>
                    <div class="value">${leadData.nome}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Empresa</div>
                    <div class="value">${leadData.empresa}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Email</div>
                    <div class="value">
                      <a href="mailto:${leadData.email}" style="color: #6366F1;">${leadData.email}</a>
                    </div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Telefone</div>
                    <div class="value">
                      <a href="tel:${leadData.telefone}" style="color: #6366F1;">${leadData.telefone}</a>
                    </div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Cargo</div>
                    <div class="value">${leadData.cargo}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Número de Colaboradores</div>
                    <div class="value">${leadData.numeroColaboradores}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Principal Desafio</div>
                    <div class="value">${leadData.principalDesafio}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Interesse em IA</div>
                    <div class="value">${leadData.interesseIA}</div>
                  </div>
                  
                  ${leadData.mensagem ? `
                  <div class="field">
                    <div class="label">Mensagem</div>
                    <div class="value">${leadData.mensagem}</div>
                  </div>
                  ` : ''}
                  
                  <div style="text-align: center;">
                    <a href="${SUPABASE_URL}/project/default/editor/${leadData.leadId}" class="cta-button">
                      Ver no Painel Icarus →
                    </a>
                  </div>
                </div>
                
                <div class="footer">
                  <p>
                    <strong>Icarus v5.0</strong> | Gestão elevada pela IA<br>
                    © 2025 IcarusAI Technology
                  </p>
                </div>
              </body>
            </html>
          `,
        }),
      })

      if (!emailRes.ok) {
        console.error('Email send failed:', await emailRes.text())
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Lead notification sent' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error in send-lead-email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

