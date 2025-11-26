# Plano de Correções (Tipagem, Warnings e Renderização)

## Problemas identificados

1. **Configuração Pluggy sem validação e com chave obrigatória marcada como não nula**  
   O cliente Pluggy usa `this.apiKey!` nas requisições e só considera `clientId` para definir se a integração está configurada. Se `ensureApiKey` falhar ou o `clientSecret/webhook` estiver ausente, o código ainda tenta renderizar fluxos dependentes e lança erros de tempo de execução em vez de falhas de validação previsíveis. 【F:src/lib/integrations/pluggy.ts†L18-L71】【F:src/lib/integrations/pluggy.ts†L94-L132】

2. **Inicialização do Supabase aborta a renderização quando variáveis de ambiente não existem**  
   O cliente é criado imediatamente ao importar o módulo e lança um `Error` se o ambiente estiver incompleto. Isso interrompe testes, stories ou rotas estáticas antes de qualquer fallback de UI, gerando warnings de build e quebrando a renderização em ambientes parciais. 【F:src/lib/supabase/client.ts†L1-L23】

3. **Mapeamento de módulos desconectado das rotas de navegação**  
   A tabela `moduleComponents` usa chaves `string` sem relação de tipo com `navigationConfig`, permitindo divergências silenciosas: qualquer mudança de ID de rota não é refletida no mapa e resulta em placeholders inesperados ou lazy imports inexistentes. Isso é fonte de erros de renderização difíceis de rastrear. 【F:src/lib/routes/moduleRoutes.tsx†L24-L55】【F:src/lib/data/navigation.ts†L1-L93】【F:src/lib/data/navigation.ts†L560-L584】

4. **Fluxo de login com timeout sem limpeza**  
   O `setTimeout` para redireciono simulado não é cancelado quando o componente desmonta, o que pode disparar `setState` após unmount e emitir warnings em testes ou navegação rápida. Também não há tratamento de erros/tipagem no handler assíncrono. 【F:src/pages/LoginPage.tsx†L12-L32】

## Ações recomendadas

- **Pluggy**: validar configuração no carregamento (clientId, clientSecret, webhook), substituir o non-null assertion por checagens explícitas e normalizar os tipos de resposta de `supabase.functions.invoke` para propagar erros tipados antes da renderização.
- **Supabase client**: adiar a criação para um factory seguro, retornando erros controlados ou um stub em ambientes de teste; expor helpers que sinalizem configuração ausente em vez de lançar na importação.
- **Rotas/Módulos**: gerar o mapa de componentes a partir de uma união de `id` derivada de `navigationConfig`, com `satisfies`/tipos literais para prevenir divergências; adicionar verificação em build (ou teste) que garante correspondência entre rotas implementadas e lazy imports.
- **Login**: trocar o `setTimeout` por navegação assíncrona real ou usar `useEffect` com cleanup para cancelar timers; adicionar tratamento de erro/tipagem explícita no handler para evitar warnings de state update após unmount.
