import { Resend } from 'https://esm.sh/resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
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
    const lead = await req.json()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Novo Lead - Icarus v5.0</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0;">🚀 Novo Lead - Icarus v5.0</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div style="color: #DC2626; font-weight: 600;">⚡ Lead Quente - Ação Recomendada</div>
              <div style="color: #991B1B; font-size: 14px;">Responda dentro de 24 horas</div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">NOME COMPLETO</div>
              <div style="color: #1F2937;">${lead.nome_completo}</div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">EMAIL</div>
              <div style="color: #1F2937;"><a href="mailto:${lead.email}" style="color: #4F46E5;">${lead.email}</a></div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">TELEFONE</div>
              <div style="color: #1F2937;">${lead.telefone}</div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">EMPRESA</div>
              <div style="color: #1F2937;">${lead.empresa}</div>
            </div>

            ${lead.interesse_em && lead.interesse_em.length > 0 ? `
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">ÁREAS DE INTERESSE</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                ${lead.interesse_em.map((i: string) => `<span style="background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${i}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${lead.mensagem ? `
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366F1; margin-bottom: 15px;">
              <div style="font-weight: 600; color: #4F46E5; font-size: 14px; margin-bottom: 5px;">MENSAGEM</div>
              <div style="color: #1F2937;">${lead.mensagem}</div>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-center; color: #6B7280; font-size: 14px;">
              <strong>Icarus v5.0</strong> - Gestão elevada pela IA<br>
              © 2025 IcarusAI Technology
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Icarus v5.0 <onboarding@resend.dev>',
      to: ['dax@newortho.com.br'],
      subject: `🚀 Novo Lead: ${lead.empresa} - ${lead.nome_completo}`,
      html: emailHtml,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})

