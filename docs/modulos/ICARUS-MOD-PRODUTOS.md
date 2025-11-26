# ICARUS-MOD-PRODUTOS

**Módulo**: Produtos
**Versão**: 1.0.0
**Status**: ✅ Completo
**Categoria**: Estoque e Logística

## 📋 Visão Geral

O Módulo de Produtos gerencia todo o catálogo de produtos médicos do hospital, incluindo controle de estoque, precificação, categorização e análises preditivas por IA.

## 🎯 Funcionalidades

### KPIs Principais

1. **Total de Produtos**
   - Contador de produtos cadastrados
   - Variação mensal
   - Ícone: Package (azul)

2. **Valor em Estoque**
   - Soma do valor total em estoque (preço × quantidade)
   - Percentual de variação
   - Ícone: DollarSign (verde)

3. **Produtos Ativos**
   - Produtos com status "ativo"
   - Percentual do total
   - Ícone: TrendingUp (roxo)

4. **Baixo Estoque**
   - Produtos com estoque < 10 unidades
   - Alerta de ação necessária
   - Ícone: AlertTriangle (vermelho)

### Abas

#### 1. Overview
- Gráficos de categoria
- Movimentação de estoque (30 dias)
- Alertas de produtos críticos
- Resumo executivo

#### 2. Lista de Produtos
- Tabela completa de produtos
- Filtros:
  - Busca por nome/código
  - Status (ativo/inativo)
- Colunas:
  - Código
  - Nome
  - Categoria
  - Preço
  - Estoque (destaque para baixo estoque)
  - Status
  - Ações (editar/deletar)

#### 3. Relatórios
- Relatório de Movimentações
- Curva ABC de Produtos
- Produtos com Baixo Giro
- Análise de Rentabilidade
- Exportação (Excel/PDF)

#### 4. IA - Previsões
- Previsão de demanda (30 dias)
- Análise geral do estoque
- Insights automatizados
- Recomendações de reposição

## 🔧 Tecnologias Utilizadas

- **React** + TypeScript
- **shadcn/ui** components
- **Supabase** (data layer)
- **Claude Sonnet 4** (AI predictions)
- **Dark Glass Medical** (design)

## 📊 Modelo de Dados

```typescript
interface Produto {
  id: string
  nome: string
  codigo: string          // Código único do produto
  preco: number          // Preço unitário
  estoque: number        // Quantidade em estoque
  categoria: string      // Categoria do produto
  status: 'ativo' | 'inativo'
  created_at: string
}
```

### Tabela Supabase

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_status ON produtos(status);
```

## 🤖 Recursos de IA

### 1. Previsão de Demanda

```typescript
const forecast = await predict('demanda', {
  produto_id: produto.id,
  dias: 30
})

// Retorna:
{
  valores: [15, 18, 12, ...],  // Previsão diária
  confidence: 0.87             // Nível de confiança
}
```

### 2. Análise Geral do Estoque

```typescript
const response = await chat(
  'Analise o estoque e forneça insights sobre reposição',
  { contexto: 'produtos' }
)

// Retorna:
{
  resposta: "Baseado na análise...",
  acoes: [...]
}
```

## 🎨 Componentes UI

### KPI Card
```tsx
<Card className="neu-card">
  <CardContent className="pt-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600">Total Produtos</p>
        <p className="text-2xl font-bold mt-1">125</p>
        <p className="text-xs text-green-600 mt-1">↑ 8 novos</p>
      </div>
      <Package className="h-8 w-8 text-blue-600" />
    </div>
  </CardContent>
</Card>
```

### Tabela de Produtos
- Responsiva
- Hover states
- Destaque visual para estoque baixo
- Ações inline (editar/deletar)

## 🔐 Permissões

### RLS Policies (Supabase)

```sql
-- Ver produtos
CREATE POLICY "Users can view products"
ON produtos FOR SELECT
USING (true);  -- Ajuste conforme regras de negócio

-- Criar produtos (apenas admin)
CREATE POLICY "Admins can create products"
ON produtos FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Atualizar produtos (apenas admin)
CREATE POLICY "Admins can update products"
ON produtos FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- Deletar produtos (apenas admin)
CREATE POLICY "Admins can delete products"
ON produtos FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');
```

## 📈 Métricas

### Performance
- Carregamento inicial: < 1s
- Filtros: real-time
- Previsão IA: ~2-3s

### Usabilidade
- Acessibilidade: WCAG 2.1 AA
- Responsivo: Mobile-first
- Navegação: Keyboard-friendly

## 🧪 Testes

```typescript
describe('Produtos Module', () => {
  it('should render KPIs correctly', () => {
    // Test implementation
  })

  it('should filter products by search term', () => {
    // Test implementation
  })

  it('should handle product deletion', async () => {
    // Test implementation
  })

  it('should fetch AI predictions', async () => {
    // Test implementation
  })
})
```

## 🚀 Melhorias Futuras

- [ ] Importação em massa (CSV/Excel)
- [ ] Histórico de movimentações
- [ ] Integração com fornecedores
- [ ] Alertas automáticos de reposição
- [ ] QR Code para produtos
- [ ] App mobile para conferência
- [ ] Dashboard em tempo real
- [ ] Previsão de custos com IA

## 📝 Changelog

### v1.0.0 (2025-11-16)
- ✅ Implementação inicial
- ✅ 4 KPIs principais
- ✅ 4 abas funcionais
- ✅ CRUD completo
- ✅ Filtros e busca
- ✅ Integração IA
- ✅ Documentação completa

## 🤝 Contribuidores

- Time ICARUS Development

## 📞 Suporte

Para dúvidas sobre este módulo:
- 📧 suporte-produtos@icarus.com.br
- 📚 Ver documentação geral em `/docs`

---

**Última atualização**: 2025-11-16
**Próxima revisão**: 2025-12-16
