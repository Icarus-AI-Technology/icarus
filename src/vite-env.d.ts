/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PLUGGY_CLIENT_ID?: string
  readonly VITE_PLUGGY_WEBHOOK_URL?: string
  readonly VITE_PLUGGY_SANDBOX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
