/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ANTHROPIC_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
  readonly VITE_ENABLE_AI_FEATURES?: string
  readonly VITE_ENABLE_REALTIME?: string
  readonly VITE_ENABLE_PWA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
