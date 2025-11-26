# Supabase Edge Functions - Novas Features 2024/2025

## 🚀 Atualizações Disponíveis

Supabase lançou 3 grandes atualizações para Edge Functions em dezembro de 2024:

1. **WebSocket Support** - Suporte nativo a WebSockets
2. **Ephemeral Storage** - Armazenamento temporário de arquivos
3. **Background Tasks** - Tarefas assíncronas em segundo plano

---

## 📡 1. WebSocket Support

### Casos de Uso
- ✅ OpenAI Realtime API
- ✅ Chat em tempo real
- ✅ Streaming de dados
- ✅ Notificações push
- ✅ Colaboração em tempo real

### Exemplo: Chat com WebSocket

```typescript
// supabase/functions/websocket-chat/index.ts

Deno.serve((req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    console.log("WebSocket connected");
    socket.send(JSON.stringify({ type: "connected", message: "Welcome!" }));
  });

  socket.addEventListener("message", (event) => {
    console.log("Message received:", event.data);
    
    // Echo back
    socket.send(JSON.stringify({
      type: "echo",
      data: event.data,
      timestamp: new Date().toISOString()
    }));
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket closed");
  });

  return response;
});
```

### Exemplo: OpenAI Realtime API

```typescript
// supabase/functions/openai-realtime/index.ts

import { RealtimeClient } from '@openai/realtime-api-beta';

Deno.serve(async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const client = new RealtimeClient({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    model: 'gpt-4o-realtime-preview',
  });

  await client.connect();

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);
    
    // Send to OpenAI
    await client.sendUserMessage(data.message);
    
    // Stream response back
    client.on('conversation.item.completed', (item) => {
      socket.send(JSON.stringify({
        type: 'response',
        content: item.content
      }));
    });
  });

  return response;
});
```

### Client-Side (React)

```tsx
// src/hooks/useWebSocket.ts

import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  }, [ws, isConnected]);

  return { messages, sendMessage, isConnected };
}
```

---

## 💾 2. Ephemeral Storage

### Características
- Armazenamento temporário em `/tmp`
- Útil para processamento de arquivos
- Automaticamente limpo após execução
- Tamanho máximo: 512 MB

### Exemplo: Processamento de ZIP

```typescript
// supabase/functions/process-zip/index.ts

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { fileUrl } = await req.json();

  // Download file to ephemeral storage
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const tempPath = `/tmp/${crypto.randomUUID()}.zip`;
  
  await Deno.writeFile(tempPath, new Uint8Array(arrayBuffer));

  // Process ZIP
  const unzipPath = `/tmp/${crypto.randomUUID()}`;
  await Deno.mkdir(unzipPath);
  
  const process = Deno.run({
    cmd: ["unzip", tempPath, "-d", unzipPath],
  });
  
  await process.status();

  // Read processed files
  const files = [];
  for await (const entry of Deno.readDir(unzipPath)) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(`${unzipPath}/${entry.name}`);
      files.push({ name: entry.name, content });
    }
  }

  // Cleanup is automatic after function execution
  
  return new Response(
    JSON.stringify({ files }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

### Exemplo: Conversão de Imagem

```typescript
// supabase/functions/convert-image/index.ts

import { createClient } from '@supabase/supabase-js';
import Magick from 'https://deno.land/x/imagemagick_deno@0.0.26/mod.ts';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { imagePath, format = 'webp' } = await req.json();

  // Download from Storage
  const { data: imageData } = await supabase
    .storage
    .from('images')
    .download(imagePath);

  // Save to ephemeral storage
  const tempInput = `/tmp/input-${crypto.randomUUID()}.png`;
  const tempOutput = `/tmp/output-${crypto.randomUUID()}.${format}`;
  
  await Deno.writeFile(tempInput, new Uint8Array(await imageData!.arrayBuffer()));

  // Convert with ImageMagick
  await Magick.convert([
    tempInput,
    '-quality', '85',
    '-resize', '1200x1200>',
    tempOutput
  ]);

  // Upload converted image
  const converted = await Deno.readFile(tempOutput);
  const newPath = imagePath.replace(/\.[^.]+$/, `.${format}`);
  
  const { error } = await supabase
    .storage
    .from('images')
    .upload(newPath, converted, { contentType: `image/${format}` });

  if (error) throw error;

  return new Response(
    JSON.stringify({ path: newPath }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

---

## ⚡ 3. Background Tasks

### Características
- Responde ao usuário imediatamente
- Executa tarefas em segundo plano
- Útil para processamento pesado
- Timeout: até 5 minutos

### Exemplo: Envio de Email em Background

```typescript
// supabase/functions/send-notification/index.ts

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { userId, message } = await req.json();

  // Responde imediatamente
  const response = new Response(
    JSON.stringify({ success: true, message: "Processando..." }),
    { 
      status: 202,
      headers: { "Content-Type": "application/json" } 
    }
  );

  // Background task
  req.signal.addEventListener("abort", () => {
    console.log("Request aborted, but background task continues");
  });

  // Executa em background
  (async () => {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role para background
    );

    // Busca dados do usuário
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    // Envia email (Resend, SendGrid, etc.)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notificacoes@icarus.com.br',
        to: user.email,
        subject: 'Nova Notificação',
        html: `<p>Olá ${user.name},</p><p>${message}</p>`,
      }),
    });

    // Registra log
    await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        message,
        sent_at: new Date().toISOString(),
      });

    console.log(`Email sent to ${user.email}`);
  })();

  return response;
});
```

### Exemplo: Processamento IcarusBrain

```typescript
// supabase/functions/icarus-brain-process/index.ts

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { analysisType, dataId } = await req.json();

  // Responde imediatamente
  const jobId = crypto.randomUUID();
  const response = new Response(
    JSON.stringify({ 
      jobId, 
      status: "processing",
      message: "Análise iniciada em background" 
    }),
    { 
      status: 202,
      headers: { "Content-Type": "application/json" } 
    }
  );

  // Background processing
  (async () => {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    try {
      // Busca dados
      const { data } = await supabase
        .from('analysis_data')
        .select('*')
        .eq('id', dataId)
        .single();

      // Executa IA (exemplo: previsão de demanda)
      const result = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente de análise de dados médicos.'
            },
            {
              role: 'user',
              content: `Analise os seguintes dados: ${JSON.stringify(data)}`
            }
          ],
        }),
      }).then(r => r.json());

      // Salva resultado
      await supabase
        .from('analysis_results')
        .insert({
          job_id: jobId,
          analysis_type: analysisType,
          data_id: dataId,
          result: result.choices[0].message.content,
          completed_at: new Date().toISOString(),
        });

      console.log(`Analysis ${jobId} completed`);
    } catch (error) {
      // Registra erro
      await supabase
        .from('analysis_results')
        .insert({
          job_id: jobId,
          analysis_type: analysisType,
          data_id: dataId,
          error: error.message,
          completed_at: new Date().toISOString(),
        });

      console.error(`Analysis ${jobId} failed:`, error);
    }
  })();

  return response;
});
```

---

## 🔧 Setup e Deploy

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login

```bash
supabase login
```

### 3. Criar Edge Function

```bash
supabase functions new my-function
```

### 4. Deploy

```bash
supabase functions deploy my-function --project-ref your-project-ref
```

### 5. Configurar Secrets

```bash
supabase secrets set OPENAI_API_KEY=your_key --project-ref your-project-ref
```

---

## 📝 Integração com ICARUS

### IcarusBrain + Edge Functions

```typescript
// src/lib/ai/edge-functions.ts

import { supabase } from '@/lib/supabase/client';

export async function analyzeWithIcarusBrain(
  type: 'demanda' | 'inadimplencia' | 'churn',
  data: any
) {
  // Chama Edge Function com background task
  const { data: job, error } = await supabase.functions.invoke(
    'icarus-brain-process',
    {
      body: {
        analysisType: type,
        dataId: data.id,
      },
    }
  );

  if (error) throw error;

  return job; // { jobId, status, message }
}

export async function getAnalysisResult(jobId: string) {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error) throw error;
  return data;
}
```

### Real-time com WebSocket

```typescript
// src/components/ChatWidget.tsx

import { useWebSocket } from '@/hooks/useWebSocket';

export function ChatWidget() {
  const { messages, sendMessage, isConnected } = useWebSocket(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/websocket-chat`
  );

  const handleSend = (text: string) => {
    sendMessage({ type: 'message', content: text });
  };

  return (
    <div className="neu-soft rounded-xl p-4">
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="p-2 bg-[var(--surface-inset)] rounded-lg">
            {msg.content}
          </div>
        ))}
      </div>
      {/* Input para enviar mensagens */}
    </div>
  );
}
```

---

## 🚀 Próximos Passos

1. ✅ **Implementar WebSocket para Chat/Notificações**
2. ✅ **Usar Background Tasks para IcarusBrain**
3. ✅ **Ephemeral Storage para processamento de arquivos**
4. ✅ **Migrar APIs pesadas para Edge Functions**

---

## 📚 Recursos

- **Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **WebSocket Guide**: https://supabase.com/docs/guides/functions/websockets
- **Background Tasks**: https://supabase.com/docs/guides/functions/background-tasks
- **Ephemeral Storage**: https://supabase.com/docs/guides/functions/ephemeral-storage

---

**Versão**: Supabase 2.81.1  
**Data**: 2025-11-26  
**Projeto**: ICARUS v5.0.3

