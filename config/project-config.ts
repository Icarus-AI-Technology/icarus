// ============================================================================
// ICARUS v6.0 - PROJECT CONFIGURATION FILES
// ============================================================================

// ==================== vite.config.ts ====================
/*
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:54321/functions/v1', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') }
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        }
      }
    }
  }
});
*/

// ==================== tsconfig.json ====================
/*
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
*/

// ==================== tailwind.config.ts ====================
/*
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/** /*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: '#050508', secondary: '#0a0a0f', tertiary: '#12121a', elevated: '#1a1a24' },
        glass: { DEFAULT: 'rgba(255, 255, 255, 0.03)', hover: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.08)' },
        accent: { primary: '#3b82f6', secondary: '#14b8a6' },
        status: { success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', info: '#06b6d4' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      backdropBlur: { glass: '16px' },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
        'neu-out': '4px 4px 8px rgba(0, 0, 0, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.03)',
        'neu-in': 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.03)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': { '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
*/

// ==================== .env.example ====================
/*
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Open Finance (Pluggy)
PLUGGY_CLIENT_ID=your-client-id
PLUGGY_CLIENT_SECRET=your-secret
PLUGGY_WEBHOOK_SECRET=your-webhook-secret

# InfoSimples
INFOSIMPLES_TOKEN=your-token

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
*/

// ==================== package.json ====================
/*
{
  "name": "icarus-v6",
  "version": "6.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/** /*.{ts,tsx,css,json}\"",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:migrate": "supabase migration up",
    "supabase:gen-types": "supabase gen types typescript --local > src/types/database.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@langchain/anthropic": "^0.3.0",
    "@langchain/community": "^0.3.0",
    "@langchain/core": "^0.3.0",
    "@langchain/langgraph": "^0.2.0",
    "@langchain/openai": "^0.3.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@supabase/supabase-js": "^2.45.0",
    "@upstash/redis": "^1.34.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.6.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.15.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.0",
    "prettier": "^3.3.0",
    "supabase": "^1.190.0",
    "tailwindcss": "^4.1.0",
    "tailwindcss-animate": "^1.0.0",
    "typescript": "^5.9.0",
    "vite": "^6.4.0"
  }
}
*/

// ==================== .eslintrc.cjs ====================
/*
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
*/

// ==================== .prettierrc ====================
/*
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"]
}
*/

// ==================== supabase/config.toml ====================
/*
[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 16

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:3000"
jwt_expiry = 3600

[storage]
enabled = true
file_size_limit = "50MiB"

[edge_runtime]
enabled = true
policy = "oneshot"
*/

// ==================== vercel.json ====================
/*
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "regions": ["gru1"],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
*/

// ==================== .github/workflows/ci.yml ====================
/*
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
*/

// ==================== types/database.ts (Generated by Supabase) ====================
export interface Database {
  public: {
    Tables: {
      empresas: { Row: { id: string; cnpj: string; razao_social: string; nome_fantasia: string | null; ativo: boolean; criado_em: string; atualizado_em: string; }; Insert: Omit<this['Row'], 'id' | 'criado_em' | 'atualizado_em'>; Update: Partial<this['Insert']>; };
      usuarios: { Row: { id: string; empresa_id: string; auth_id: string | null; nome: string; email: string; ativo: boolean; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      produtos: { Row: { id: string; empresa_id: string; codigo: string; nome: string; registro_anvisa: string | null; classe_risco: string | null; ativo: boolean; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      lotes: { Row: { id: string; empresa_id: string; produto_id: string; numero_lote: string; data_validade: string; quantidade_atual: number; status: string; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      cirurgias: { Row: { id: string; empresa_id: string; numero: string; hospital_id: string; medico_id: string; procedimento: string; data_agendamento: string; status: string; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      rastreabilidade_opme: { Row: { id: string; empresa_id: string; cirurgia_id: string; produto_id: string; lote_id: string; numero_lote: string; registro_anvisa: string; data_implante: string; paciente_iniciais: string; medico_nome: string; medico_crm: string; hospital_nome: string; hash_registro: string; }; Insert: Omit<this['Row'], 'id' | 'hash_registro'>; Update: never; };
      transacoes_bancarias: { Row: { id: string; empresa_id: string; conta_bancaria_id: string; data_transacao: string; descricao: string; valor: number; tipo: 'credito' | 'debito'; auditoria_status: string; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      alertas_financeiros: { Row: { id: string; empresa_id: string; tipo: string; severidade: string; titulo: string; descricao: string | null; status: string; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      sugestoes_financeiras: { Row: { id: string; empresa_id: string; tipo: string; titulo: string; descricao: string; economia_estimada: number | null; prioridade: string; status: string; }; Insert: Omit<this['Row'], 'id'>; Update: Partial<this['Insert']>; };
      audit_log_blockchain: { Row: { id: string; block_index: number; previous_hash: string; hash: string; nonce: number; empresa_id: string; tabela: string; registro_id: string; acao: string; criado_em: string; }; Insert: never; Update: never; };
    };
    Views: {
      vw_estoque: { Row: { produto_id: string; empresa_id: string; codigo: string; nome: string; quantidade_disponivel: number; quantidade_reservada: number; status_estoque: string; }; };
      vw_cirurgias_dashboard: { Row: { empresa_id: string; status: string; total: number; hoje: number; amanha: number; proximos_7_dias: number; }; };
    };
    Functions: {
      search_vectors: { Args: { query_embedding: number[]; p_empresa_id: string; p_source_type?: string; match_threshold?: number; match_count?: number; }; Returns: { id: string; content: string; similarity: number; }[]; };
      mine_audit_block: { Args: { p_empresa_id: string; p_usuario_id?: string; p_tabela: string; p_registro_id: string; p_acao: string; p_dados_antes?: any; p_dados_depois?: any; }; Returns: string; };
      validate_blockchain: { Args: { p_empresa_id: string; }; Returns: { valid: boolean; total_blocks: number; invalid_block: number | null; error_message: string; }[]; };
    };
  };
}
