# 🔗 ICARUS v5.0 - Configuração de Conexão Supabase

**Data**: 2025-11-16  
**Status**: ✅ Credenciais Obtidas - Pronto para Conectar

---

## 📋 PASSO A PASSO PARA CONEXÃO

### 1️⃣ Criar Arquivo .env

Na raiz do projeto `/Users/daxmeneghel/.cursor/worktrees/icarus/2a0Tj/`, crie um arquivo `.env` com o seguinte conteúdo:

```env
# =====================================================
# ICARUS v5.0 - Environment Variables
# =====================================================

# Supabase Configuration (✅ CREDENCIAIS VÁLIDAS)
VITE_SUPABASE_URL=https://caboihnpxxrjbebteelj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYm9paG5weHhyamJlYnRlZWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTcyNDEsImV4cCI6MjA3ODQzMzI0MX0.X6-N8eO0HhJtzW95QXSYFrgAKuhTA06RkQu0gloMnSE

# Claude AI (Anthropic) - OPCIONAL
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Application Settings
VITE_APP_NAME=ICARUS
VITE_APP_VERSION=5.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=true
```

### 2️⃣ Instalar Dependências (se ainda não instalou)

```bash
cd /Users/daxmeneghel/.cursor/worktrees/icarus/2a0Tj
pnpm install
```

### 3️⃣ Iniciar Aplicação

```bash
pnpm dev
```

A aplicação deve iniciar em: **http://localhost:5173**

---

## ✅ VERIFICAÇÕES

### Cliente Supabase Já Configurado

O arquivo `src/lib/config/supabase-client.ts` já está configurado corretamente:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### Tipos TypeScript PT-BR

Os tipos TypeScript já estão definidos em PT-BR no mesmo arquivo:

- ✅ `empresas`
- ✅ `perfis`
- ✅ `categorias_produtos`
- ✅ `fabricantes`
- ✅ `produtos`
- ✅ `hospitais`
- ✅ `medicos`
- ✅ `cirurgias`
- ✅ `itens_cirurgia`
- ✅ `notas_fiscais`
- ✅ `contas_receber`
- ✅ `movimentacoes_estoque`

---

## 🧪 TESTAR CONEXÃO

### Opção 1: Via Console do Navegador

Após iniciar a aplicação, abra o console do navegador (F12) e execute:

```javascript
// Verificar configuração
console.log(window.__SUPABASE_CONFIG__);

// Testar query simples
const { data, error } = await supabase
  .from('produtos')
  .select('id, nome, codigo')
  .limit(5);

console.log('Produtos:', data);
console.log('Erro:', error);
```

### Opção 2: Criar Página de Teste

Crie `src/pages/TestConnection.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/config/supabase-client';

export function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Testar query simples
        const { data: produtos, error: produtosError } = await supabase
          .from('produtos')
          .select('id, nome, codigo')
          .limit(5);

        if (produtosError) throw produtosError;

        setData(produtos);
        setStatus('success');
      } catch (err) {
        console.error('Erro ao conectar:', err);
        setError(err);
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
      
      {status === 'loading' && <p>Testando conexão...</p>}
      
      {status === 'success' && (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-green-800 font-bold">✅ Conexão Bem-Sucedida!</h2>
          <p className="mt-2">Produtos encontrados: {data?.length || 0}</p>
          <pre className="mt-4 bg-white p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {status === 'error' && (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-red-800 font-bold">❌ Erro na Conexão</h2>
          <pre className="mt-4 bg-white p-4 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 INFORMAÇÕES DAS CREDENCIAIS

### Supabase Project

- **Project URL**: `https://caboihnpxxrjbebteelj.supabase.co`
- **Project ID**: `caboihnpxxrjbebteelj`
- **Region**: Não especificada (provavelmente US East)

### Anon Key (Pública)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYm9paG5weHhyamJlYnRlZWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTcyNDEsImV4cCI6MjA3ODQzMzI0MX0.X6-N8eO0HhJtzW95QXSYFrgAKuhTA06RkQu0gloMnSE
```

- **Tipo**: JWT (JSON Web Token)
- **Role**: `anon` (público)
- **Emitido**: 1762857241 (Unix timestamp)
- **Expira**: 2078433241 (Unix timestamp - válido até ~2036)

⚠️ **Nota de Segurança**: Esta chave é segura para uso público (frontend). Para operações administrativas, use a Service Role Key (não exposta aqui).

---

## 📊 DADOS DISPONÍVEIS NO BANCO

Ao conectar, você terá acesso imediato a:

- **53 produtos** (Abbott Vascular, Cardiologia, Neurovascular)
- **15 cirurgias** registradas
- **12 médicos** cadastrados
- **8 hospitais** clientes
- **5 categorias** de produtos
- **5 fabricantes**
- **1 empresa** distribuidora

---

## 🚀 PRÓXIMOS PASSOS

Após configurar o .env e iniciar a aplicação:

1. ✅ Testar conexão (console ou página de teste)
2. ✅ Verificar módulos funcionando
3. ✅ Validar queries PT-BR
4. ✅ Testar autenticação (se necessário)
5. ✅ Configurar RLS policies (se necessário)

---

## ❓ TROUBLESHOOTING

### Erro: "Supabase credentials not found"

**Solução**: Verifique se o arquivo `.env` está na raiz do projeto e reinicie o servidor de desenvolvimento.

### Erro: "Failed to fetch"

**Solução**: Verifique se a URL do Supabase está correta e se há conexão com a internet.

### Erro: "Invalid API key"

**Solução**: Verifique se a ANON_KEY foi copiada completamente (é uma string longa).

### Queries retornam vazio

**Solução**: Verifique as RLS policies no Supabase. Pode ser necessário desabilitar RLS temporariamente para testes ou configurar policies adequadas.

---

## 📞 SUPORTE

Se precisar de ajuda:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor de desenvolvimento
3. Consulte a documentação: https://supabase.com/docs

---

**Status**: ✅ PRONTO PARA CONECTAR

Basta criar o arquivo `.env` com as credenciais acima e iniciar a aplicação!

