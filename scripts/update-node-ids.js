#!/usr/bin/env node

/**
 * Script Helper para atualizar Node IDs do Figma
 *
 * Este script ajuda a atualizar os placeholders YOUR_NODE_ID
 * nos arquivos .figma.tsx com os Node IDs reais do Figma.
 *
 * Uso:
 *   node update-node-ids.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Arquivos que precisam de Node IDs
const FILES_TO_UPDATE = [
  {
    path: 'src/components/ui/neu-button.figma.tsx',
    component: 'NeuButton',
    description: 'Botão neumórfico com variants e loading states'
  },
  {
    path: 'src/components/ui/neu-card.figma.tsx',
    component: 'NeuCard',
    description: 'Card com elevação neumórfica'
  },
  {
    path: 'src/components/ui/neu-input.figma.tsx',
    component: 'NeuInput',
    description: 'Input com validação e error states'
  },
  {
    path: 'src/components/layout/sidebar.figma.tsx',
    component: 'Sidebar',
    description: 'Sidebar responsivo com navegação'
  }
];

console.log('\n🎨 ICARUS Code Connect - Atualizar Node IDs\n');
console.log('════════════════════════════════════════════\n');

console.log('📋 INSTRUÇÕES:\n');
console.log('1. Abra o arquivo Figma do ICARUS Design System');
console.log('2. Para cada componente abaixo:');
console.log('   a) Selecione o componente no Figma');
console.log('   b) Clique com botão direito → "Copy link to selection"');
console.log('   c) Cole o link aqui quando solicitado');
console.log('   d) O script extrairá automaticamente o Node ID\n');
console.log('────────────────────────────────────────────\n');

// Função para extrair Node ID de uma URL do Figma
function extractNodeId(url) {
  // Formato: https://www.figma.com/design/FILE_ID?node-id=123-456
  const match = url.match(/node-id=([0-9]+-[0-9]+)/);
  if (!match) {
    throw new Error('URL inválida. Certifique-se de copiar o link completo do Figma.');
  }

  // Converter 123-456 para 123:456
  return match[1].replace('-', ':');
}

// Função para atualizar arquivo com Node ID
function updateFile(filePath, nodeId) {
  const fullPath = resolve(filePath);
  let content = readFileSync(fullPath, 'utf-8');

  // Substituir YOUR_NODE_ID pelo Node ID real
  content = content.replace(/YOUR_NODE_ID/g, nodeId);

  writeFileSync(fullPath, content, 'utf-8');
}

// Modo interativo
async function interactive() {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log('🔄 MODO INTERATIVO\n');

  const nodeIds = {};

  for (const file of FILES_TO_UPDATE) {
    console.log(`\n📦 ${file.component}`);
    console.log(`   ${file.description}\n`);

    const url = await question('   Cole o link do Figma: ');

    try {
      const nodeId = extractNodeId(url.trim());
      nodeIds[file.component] = nodeId;
      console.log(`   ✅ Node ID: ${nodeId}\n`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
      rl.close();
      process.exit(1);
    }
  }

  console.log('\n────────────────────────────────────────────\n');
  console.log('📝 RESUMO:\n');

  for (const file of FILES_TO_UPDATE) {
    console.log(`   ${file.component}: ${nodeIds[file.component]}`);
  }

  const confirm = await question('\n❓ Confirmar e atualizar arquivos? (s/n): ');

  if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'y') {
    console.log('\n🔧 Atualizando arquivos...\n');

    for (const file of FILES_TO_UPDATE) {
      updateFile(file.path, nodeIds[file.component]);
      console.log(`   ✅ ${file.path}`);
    }

    console.log('\n✨ Arquivos atualizados com sucesso!\n');
    console.log('🚀 Próximos passos:\n');
    console.log('   1. npx figma connect auth');
    console.log('   2. npm run figma:publish');
    console.log('   3. npm run figma:list\n');
  } else {
    console.log('\n❌ Operação cancelada.\n');
  }

  rl.close();
}

// Modo direto (com argumentos)
function direct(args) {
  if (args.length !== FILES_TO_UPDATE.length) {
    console.log('❌ Número incorreto de Node IDs.\n');
    console.log('Uso: node update-node-ids.js NODE_ID1 NODE_ID2 NODE_ID3 NODE_ID4\n');
    console.log('Ou execute sem argumentos para modo interativo.\n');
    process.exit(1);
  }

  console.log('🔧 Atualizando arquivos...\n');

  FILES_TO_UPDATE.forEach((file, index) => {
    const nodeId = args[index];
    updateFile(file.path, nodeId);
    console.log(`   ✅ ${file.component}: ${nodeId}`);
  });

  console.log('\n✨ Arquivos atualizados com sucesso!\n');
  console.log('🚀 Próximos passos:\n');
  console.log('   1. npx figma connect auth');
  console.log('   2. npm run figma:publish');
  console.log('   3. npm run figma:list\n');
}

// Executar
const args = process.argv.slice(2);

if (args.length === 0) {
  interactive();
} else {
  direct(args);
}
