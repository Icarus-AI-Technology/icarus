# Refatoração PT-BR - Guia Completo de Mapeamento

## Status Atual

✅ **FASE 1 COMPLETA**: Backend/BD 100% PT-BR
- 4 Migrations SQL criadas (004, 005, 006)
- 12 tabelas renomeadas
- 120+ campos convertidos
- RLS Policies atualizadas
- Tipos TypeScript atualizados
- Seed data em PT-BR

🔄 **FASE 2 EM PROGRESSO**: Frontend (Módulos)
- ProdutosOPME.tsx: 70% concluído (interfaces e queries SELECT)
- Restante: Pendente

## Mapeamento Completo de Campos por Tabela

### 1. EMPRESAS (companies)
| EN | PT-BR |
|---|---|
| id | id |
| name | nome |
| cnpj | cnpj |
| address | endereco |
| city | cidade |
| state | estado |
| phone | telefone |
| email | email |
| status | status ('active'→'ativo', 'inactive'→'inativo', 'suspended'→'suspenso') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 2. PERFIS (profiles)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| full_name | nome_completo |
| email | email |
| role | papel ('admin'→'admin', 'manager'→'gerente', 'user'→'usuario', 'viewer'→'visualizador') |
| avatar_url | url_avatar |
| phone | telefone |
| is_active | ativo |
| created_at | criado_em |
| updated_at | atualizado_em |

### 3. CATEGORIAS_PRODUTOS (product_categories)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| name | nome |
| code | codigo |
| specialty | especialidade |
| description | descricao |
| status | status ('active'→'ativo', 'inactive'→'inativo') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 4. FABRICANTES (manufacturers)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| name | nome |
| cnpj | cnpj |
| country | pais |
| phone | telefone |
| email | email |
| website | website |
| status | status ('active'→'ativo', 'inactive'→'inativo') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 5. PRODUTOS (products)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| category_id | categoria_id |
| manufacturer_id | fabricante_id |
| name | nome |
| code | codigo |
| anvisa_code | codigo_anvisa |
| product_type | tipo_produto |
| specialty | especialidade |
| description | descricao |
| cost_price | preco_custo |
| sale_price | preco_venda |
| stock_quantity | quantidade_estoque |
| min_stock | estoque_minimo |
| max_stock | estoque_maximo |
| unit | unidade |
| status | status ('active'→'ativo', 'inactive'→'inativo', 'discontinued'→'descontinuado') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 6. HOSPITAIS (hospitals)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| name | nome |
| cnpj | cnpj |
| address | endereco |
| city | cidade |
| state | estado |
| phone | telefone |
| email | email |
| contract_type | tipo_contrato |
| status | status ('active'→'ativo', 'inactive'→'inativo', 'suspended'→'suspenso') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 7. MEDICOS (doctors)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| name | nome |
| crm | crm |
| crm_state | crm_estado |
| specialty | especialidade |
| phone | telefone |
| email | email |
| hospitals | hospitais_ids |
| status | status ('active'→'ativo', 'inactive'→'inativo') |
| created_at | criado_em |
| updated_at | atualizado_em |

### 8. CIRURGIAS (surgeries)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| hospital_id | hospital_id |
| doctor_id | medico_id |
| protocol_number | numero_protocolo |
| patient_name | nome_paciente |
| patient_cpf | cpf_paciente |
| procedure_name | nome_procedimento |
| procedure_code | codigo_procedimento |
| scheduled_date | data_agendada |
| realized_date | data_realizada |
| status | status ('scheduled'→'agendada', 'confirmed'→'confirmada', 'in_progress'→'em_andamento', 'completed'→'concluida', 'cancelled'→'cancelada') |
| estimated_value | valor_estimado |
| final_value | valor_final |
| notes | observacoes |
| created_at | criado_em |
| updated_at | atualizado_em |

### 9. ITENS_CIRURGIA (surgery_items)
| EN | PT-BR |
|---|---|
| id | id |
| surgery_id | cirurgia_id |
| product_id | produto_id |
| quantity | quantidade |
| unit_price | preco_unitario |
| total_price | preco_total |
| item_type | tipo_item ('used'→'usado', 'returned'→'devolvido', 'consignment'→'consignado') |
| lot_number | numero_lote |
| serial_number | numero_serie |
| notes | observacoes |
| created_at | criado_em |

### 10. NOTAS_FISCAIS (invoices)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| surgery_id | cirurgia_id |
| hospital_id | hospital_id |
| invoice_number | numero_nota |
| invoice_type | tipo_nota |
| issue_date | data_emissao |
| due_date | data_vencimento |
| total_value | valor_total |
| tax_value | valor_impostos |
| discount_value | valor_desconto |
| net_value | valor_liquido |
| status | status ('pending'→'pendente', 'approved'→'aprovada', 'sent'→'enviada', 'paid'→'paga', 'cancelled'→'cancelada') |
| xml_url | url_xml |
| pdf_url | url_pdf |
| notes | observacoes |
| created_at | criado_em |
| updated_at | atualizado_em |

### 11. CONTAS_RECEBER (accounts_receivable)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| invoice_id | nota_fiscal_id |
| hospital_id | hospital_id |
| description | descricao |
| original_value | valor_original |
| received_value | valor_recebido |
| balance | saldo |
| due_date | data_vencimento |
| payment_date | data_pagamento |
| status | status ('pending'→'pendente', 'partial'→'parcial', 'paid'→'paga', 'overdue'→'vencida', 'cancelled'→'cancelada') |
| payment_method | metodo_pagamento |
| notes | observacoes |
| created_at | criado_em |
| updated_at | atualizado_em |

### 12. MOVIMENTACOES_ESTOQUE (stock_movements)
| EN | PT-BR |
|---|---|
| id | id |
| company_id | empresa_id |
| product_id | produto_id |
| movement_type | tipo_movimentacao |
| quantity | quantidade |
| unit_price | preco_unitario |
| total_price | preco_total |
| reference_id | referencia_id |
| reference_type | tipo_referencia |
| lot_number | numero_lote |
| serial_number | numero_serie |
| notes | observacoes |
| created_by | criado_por |
| created_at | criado_em |

## Padrões de Conversão

### Convenções Gerais
```
*_id → *_id (IDs mantém sufixo, traduz o prefixo)
created_at → criado_em
updated_at → atualizado_em
name → nome
code → codigo
description → descricao
status → status (campo mantém nome, valores traduzidos)
phone → telefone
email → email (mantém)
```

### Status Values (Enum)
```
'active' → 'ativo'
'inactive' → 'inativo'
'suspended' → 'suspenso'
'discontinued' → 'descontinuado'
'pending' → 'pendente'
'approved' → 'aprovada'
'completed' → 'concluida'
'cancelled' → 'cancelada'
'scheduled' → 'agendada'
'confirmed' → 'confirmada'
'in_progress' → 'em_andamento'
```

### TypeScript Interface Naming
```typescript
// ANTES
interface Product {
  id: string;
  code: string;
  name: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
}

// DEPOIS
interface Product {
  id: string;
  codigo: string;
  nome: string;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
}
```

### Supabase Query Pattern
```typescript
// ANTES
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:product_categories(id, name),
    manufacturer:manufacturers(id, name, country)
  `)
  .eq('company_id', companyId)
  .eq('status', 'active')
  .gte('stock_quantity', 10)
  .order('name', { ascending: true })

// DEPOIS
const { data } = await supabase
  .from('produtos')
  .select(`
    *,
    categoria:categorias_produtos(id, nome),
    fabricante:fabricantes(id, nome, pais)
  `)
  .eq('empresa_id', companyId)
  .eq('status', 'ativo')
  .gte('quantidade_estoque', 10)
  .order('nome', { ascending: true })
```

### INSERT/UPDATE Pattern
```typescript
// ANTES
await supabase.from('products').insert({
  company_id: '123',
  code: 'PROD-001',
  name: 'Product Name',
  cost_price: 100,
  sale_price: 150,
  stock_quantity: 10,
  min_stock: 5,
  status: 'active'
})

// DEPOIS
await supabase.from('produtos').insert({
  empresa_id: '123',
  codigo: 'PROD-001',
  nome: 'Product Name',
  preco_custo: 100,
  preco_venda: 150,
  quantidade_estoque: 10,
  estoque_minimo: 5,
  status: 'ativo'
})
```

## Módulos que Requerem Refatoração

### Módulos com Queries Supabase Reais (PRIORIDADE ALTA)
1. ✅ **ProdutosOPME.tsx** - 70% concluído
2. **Financeiro.tsx** - invoices, accounts_receivable
3. **FaturamentoNFe.tsx** - invoices
4. **ContasReceber.tsx** - accounts_receivable
5. **Inventario.tsx** - inventories (se existir tabela)
6. **ConsignacaoAvancada.tsx** - potencialmente usa múltiplas tabelas

### Módulos com Mock Data (PRIORIDADE MÉDIA)
- Todos os demais módulos usam mock data e precisam atualizar:
  - Interfaces TypeScript
  - Mock data objects
  - Eventual preparação para queries futuras

## Scripts de Refatoração Automática

### Find & Replace Global (use com cuidado)
```bash
# Substituir referências de tabelas em queries .from()
find src/components/modules -name "*.tsx" -exec sed -i '' \
  -e "s/\.from('products')/\.from('produtos')/g" \
  -e "s/\.from('product_categories')/\.from('categorias_produtos')/g" \
  -e "s/\.from('manufacturers')/\.from('fabricantes')/g" \
  -e "s/\.from('hospitals')/\.from('hospitais')/g" \
  -e "s/\.from('doctors')/\.from('medicos')/g" \
  -e "s/\.from('surgeries')/\.from('cirurgias')/g" \
  -e "s/\.from('surgery_items')/\.from('itens_cirurgia')/g" \
  -e "s/\.from('invoices')/\.from('notas_fiscais')/g" \
  -e "s/\.from('accounts_receivable')/\.from('contas_receber')/g" \
  -e "s/\.from('stock_movements')/\.from('movimentacoes_estoque')/g" \
  {} \;
```

## Checklist de Refatoração por Módulo

Para cada módulo com queries Supabase:

- [ ] Atualizar interfaces TypeScript
- [ ] Atualizar formData/state objects
- [ ] Atualizar mock data
- [ ] Converter queries SELECT (.from, .select, .order)
- [ ] Converter queries INSERT (campos no objeto)
- [ ] Converter queries UPDATE (campos no objeto)
- [ ] Converter queries DELETE (geralmente OK, só usa .eq('id'))
- [ ] Atualizar .eq(), .gte(), .lte() com nomes PT-BR
- [ ] Atualizar JOINs (select com relacionamentos)
- [ ] Atualizar valores enum ('active' → 'ativo', etc)
- [ ] Testar compilação TypeScript
- [ ] Testar queries no ambiente (se Supabase configurado)

## Status Final

**Backend**: ✅ 100% PT-BR  
**Frontend**: 🔄 Em progresso (1/33 módulos com queries completo)

**Próximos Passos**:
1. Completar refatoração do ProdutosOPME.tsx (INSERT/UPDATE/DELETE)
2. Refatorar módulos financeiros (Financeiro, FaturamentoNFe, ContasReceber)
3. Criar módulos faltantes (52 novos) já em PT-BR
4. Atualizar documentação (README, PROGRESS.md)

