# Módulos ERP

Esta pasta contém os 58 módulos funcionais do ICARUS v5.0.

## Estrutura

Cada módulo segue o padrão:

```
[categoria]/
├── [Modulo].tsx    # Componente React
├── types.ts        # TypeScript interfaces
├── hooks.ts        # React hooks personalizados
└── api.ts          # Chamadas Supabase
```

## Categorias

1. **vendas/** - 12 módulos de vendas
2. **estoque/** - 8 módulos de estoque
3. **financeiro/** - 10 módulos financeiros
4. **crm/** - 8 módulos CRM
5. **compras/** - 6 módulos de compras
6. **gestao/** - 14 módulos de gestão

Veja [/docs/MODULES.md](/docs/MODULES.md) para lista completa.

## Desenvolvimento

Siga as regras em [.clinerules](../../.clinerules) ao criar novos módulos.
