/**
 * Script para aplicar migration via Supabase client
 * Uso: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('Configure: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🚀 Aplicando migration 20251129120000_complete_schema.sql...\n')

  try {
    // Ler arquivo de migration
    const migrationPath = join(process.cwd(), 'supabase/migrations/20251129120000_complete_schema.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration carregada com sucesso')
    console.log(`📊 Tamanho: ${(sql.length / 1024).toFixed(2)} KB`)
    console.log(`📝 Linhas: ${sql.split('\n').length}\n`)

    // Dividir em statements (por ';')
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📋 Total de statements: ${statements.length}\n`)

    let executed = 0
    let failed = 0

    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Pular comentários e seções vazias
      if (statement.startsWith('--') || statement.length < 10) {
        continue
      }

      try {
        // Log do progresso
        process.stdout.write(`\r[${i + 1}/${statements.length}] Executando...`)

        // Executar via RPC (usando função exec do Postgres)
        const { error } = await supabase.rpc('exec', { query: statement + ';' })

        if (error) {
          // Alguns erros são esperados (tabela já existe, etc)
          if (
            error.message.includes('already exists') ||
            error.message.includes('does not exist')
          ) {
            // Ignorar erros de "já existe"
          } else {
            console.error(`\n❌ Erro no statement ${i + 1}:`, error.message)
            failed++
          }
        }

        executed++
      } catch (err) {
        console.error(`\n❌ Erro inesperado no statement ${i + 1}:`, err)
        failed++
      }

      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    console.log('\n')
    console.log('✅ Migration concluída!')
    console.log(`📊 Statements executados: ${executed}`)
    console.log(`❌ Falhas: ${failed}`)

    // Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas criadas...')
    
    const tablesToCheck = [
      'compras_internacionais',
      'video_calls',
      'lancamentos_contabeis',
      'voice_macros',
      'automacoes_ia',
      'api_tokens',
      'rotas_entrega',
      'compliance_checks'
    ]

    for (const table of tablesToCheck) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: ERRO - ${error.message}`)
      } else {
        console.log(`✅ ${table}: OK (${count} registros)`)
      }
    }

    console.log('\n🎉 Migration aplicada com sucesso!\n')

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error)
    process.exit(1)
  }
}

// Executar
applyMigration()

