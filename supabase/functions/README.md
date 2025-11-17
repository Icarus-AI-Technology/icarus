# Supabase Edge Functions

This directory contains Edge Functions for the Icarus v5.0 application.

## Available Functions

### `send-lead-email`

Sends email notification when a new lead is captured from the landing page.

**Trigger**: Called from frontend after lead creation
**Destination**: dax@newortho.com.br
**Email Service**: Resend

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Set Environment Secrets

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY=re_...

# Verify secrets
supabase secrets list
```

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy send-lead-email
```

### Test Locally

```bash
# Start local development
supabase functions serve send-lead-email

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-lead-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"leadId":"test-123","nome":"João Silva","empresa":"Hospital XYZ","email":"joao@hospital.com","telefone":"(11) 99999-9999","cargo":"diretor","numeroColaboradores":"51-200","principalDesafio":"controle-estoque","interesseIA":"previsao-demanda"}'
```

## Email Provider Setup

### Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (newortho.com.br)
3. Create an API key
4. Set the API key as a Supabase secret:
   ```bash
   supabase secrets set RESEND_API_KEY=your_api_key
   ```

### Alternative: SendGrid

If you prefer SendGrid, modify the function to use SendGrid API:

```typescript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API_KEY)

await sgMail.send({
  to: 'dax@newortho.com.br',
  from: 'leads@newortho.com.br',
  subject: 'Novo Lead',
  html: emailHTML,
})
```

## Monitoring

View function logs:
```bash
supabase functions logs send-lead-email
```

View function logs in real-time:
```bash
supabase functions logs send-lead-email --follow
```

## Troubleshooting

### Function not found error
- Ensure function is deployed: `supabase functions deploy send-lead-email`
- Check project link: `supabase projects list`

### Email not sending
- Verify RESEND_API_KEY is set: `supabase secrets list`
- Check function logs: `supabase functions logs send-lead-email`
- Verify domain is verified in Resend dashboard

### CORS errors
- Ensure CORS headers are properly set in function response
- Check browser console for detailed error messages

## Security

- Edge Functions run in a secure Deno runtime
- Environment secrets are encrypted at rest
- Use service_role key for administrative operations only
- Always validate input data before processing

