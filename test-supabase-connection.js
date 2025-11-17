import { supabase, isSupabaseConfigured } from './src/lib/config/supabase-client.js';

console.log('🔍 ICARUS v5.0 - Teste de Conexão Supabase\n');

// Verificar configuração
console.log('📋 Verificando configuração...');
const isConfigured = isSupabaseConfigured();
console.log(`   Configurado: ${isConfigured ? '✅' : '❌'}\n`);

if (!isConfigured) {
  console.log('❌ Supabase não está configurado!');
  console.log('📝 Por favor, configure o arquivo .env com:');
  console.log('   VITE_SUPABASE_URL=https://caboihnpxxrjbebteelj.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY=<sua-chave-aqui>\n');
  process.exit(1);
}

// Testar conexão
console.log('🔌 Testando conexão com o banco de dados...\n');

async function testConnection() {
  try {
    // Teste 1: Listar produtos
    console.log('1️⃣  Testando query: SELECT produtos...');
    const { data: produtos, error: produtosError } = await supabase
      .from('produtos')
      .select('id, nome, codigo, preco_venda')
      .limit(5);

    if (produtosError) throw produtosError;
    console.log(`   ✅ Sucesso! ${produtos?.length || 0} produtos encontrados`);
    if (produtos && produtos.length > 0) {
      console.log(`   📦 Exemplo: ${produtos[0].nome} (${produtos[0].codigo})`);
    }

    // Teste 2: Listar hospitais
    console.log('\n2️⃣  Testando query: SELECT hospitais...');
    const { data: hospitais, error: hospitaisError } = await supabase
      .from('hospitais')
      .select('id, nome, cidade')
      .limit(3);

    if (hospitaisError) throw hospitaisError;
    console.log(`   ✅ Sucesso! ${hospitais?.length || 0} hospitais encontrados`);
    if (hospitais && hospitais.length > 0) {
      console.log(`   🏥 Exemplo: ${hospitais[0].nome} (${hospitais[0].cidade})`);
    }

    // Teste 3: Listar cirurgias
    console.log('\n3️⃣  Testando query: SELECT cirurgias...');
    const { data: cirurgias, error: cirurgiasError } = await supabase
      .from('cirurgias')
      .select('id, numero_protocolo, nome_paciente, status')
      .limit(3);

    if (cirurgiasError) throw cirurgiasError;
    console.log(`   ✅ Sucesso! ${cirurgias?.length || 0} cirurgias encontradas`);
    if (cirurgias && cirurgias.length > 0) {
      console.log(`   🏥 Exemplo: ${cirurgias[0].numero_protocolo} - ${cirurgias[0].status}`);
    }

    // Teste 4: Contar registros
    console.log('\n4️⃣  Testando contagem de registros...');
    const { count: produtosCount, error: countError } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`   ✅ Total de produtos no banco: ${produtosCount}`);

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumo:');
    console.log(`   • Produtos: ${produtosCount} total`);
    console.log(`   • Hospitais: ${hospitais?.length} testados`);
    console.log(`   • Cirurgias: ${cirurgias?.length} testadas`);
    console.log('\n🚀 Aplicação pronta para uso!');
    console.log('   Execute: pnpm dev\n');

  } catch (error) {
    console.error('\n❌ ERRO AO TESTAR CONEXÃO:\n');
    console.error(error);
    console.log('\n📝 Possíveis causas:');
    console.log('   1. Credenciais incorretas no .env');
    console.log('   2. Sem conexão com a internet');
    console.log('   3. RLS policies bloqueando acesso');
    console.log('   4. Tabelas não existem no banco\n');
    process.exit(1);
  }
}

testConnection();

