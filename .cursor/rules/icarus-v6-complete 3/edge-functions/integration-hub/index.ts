// ============================================================================
// ICARUS v6.0 - Edge Function: Integration Hub Agent
// InfoSimples + Pluggy + External APIs
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// TYPES
// ============================================================================

interface IntegrationRequest {
  empresa_id: string;
  tipo: 'cnpj' | 'cpf' | 'crm' | 'anvisa' | 'cep' | 'pluggy_connect' | 'pluggy_sync' | 'nfe';
  identificador: string;
  dados_adicionais?: Record<string, unknown>;
}

interface InfoSimplesConfig {
  baseUrl: string;
  token: string;
}

interface PluggyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const INFOSIMPLES_CONFIG: InfoSimplesConfig = {
  baseUrl: 'https://api.infosimples.com/api/v2',
  token: Deno.env.get('INFOSIMPLES_TOKEN')!,
};

const PLUGGY_CONFIG: PluggyConfig = {
  clientId: Deno.env.get('PLUGGY_CLIENT_ID')!,
  clientSecret: Deno.env.get('PLUGGY_CLIENT_SECRET')!,
  baseUrl: 'https://api.pluggy.ai',
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
  cnpj: 604800, // 7 days
  cpf: 604800,
  crm: 2592000, // 30 days
  anvisa: 2592000,
  cep: 31536000, // 1 year
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info',
      },
    });
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse request
    const body: IntegrationRequest = await req.json();
    const { empresa_id, tipo, identificador, dados_adicionais } = body;

    // Rate limiting
    const rateLimitOk = await checkRateLimit(supabase, empresa_id);
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 100 requests/hour.' }),
        { status: 429 }
      );
    }

    // Check cache first
    const cached = await getCachedResult(supabase, tipo, identificador);
    if (cached) {
      return new Response(JSON.stringify({ source: 'cache', data: cached }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Process request
    let result: unknown;
    let creditsUsed = 0;

    switch (tipo) {
      case 'cnpj':
        result = await consultaCNPJ(identificador);
        creditsUsed = 0.5;
        break;

      case 'cpf':
        result = await consultaCPF(identificador);
        creditsUsed = 0.3;
        break;

      case 'crm':
        const uf = dados_adicionais?.uf as string;
        result = await consultaCRM(identificador, uf);
        creditsUsed = 0.3;
        break;

      case 'anvisa':
        result = await consultaANVISA(identificador);
        creditsUsed = 0.5;
        break;

      case 'cep':
        result = await consultaCEP(identificador);
        creditsUsed = 0.1;
        break;

      case 'pluggy_connect':
        result = await pluggyCreateConnect(empresa_id, dados_adicionais);
        break;

      case 'pluggy_sync':
        result = await pluggySync(supabase, empresa_id, identificador);
        break;

      case 'nfe':
        result = await emitirNFe(supabase, empresa_id, identificador);
        creditsUsed = 1.0;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid integration type' }), { status: 400 });
    }

    // Cache result (except Pluggy operations)
    if (!tipo.startsWith('pluggy')) {
      await cacheResult(supabase, tipo, identificador, result, empresa_id);
    }

    // Log request
    await logRequest(supabase, empresa_id, tipo, identificador, true, creditsUsed);

    return new Response(JSON.stringify({ source: 'api', data: result }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Integration Hub error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// ============================================================================
// INFOSIMPLES INTEGRATIONS
// ============================================================================

async function consultaCNPJ(cnpj: string) {
  const cleanCnpj = cnpj.replace(/\D/g, '');

  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/receita-federal/cnpj?cnpj=${cleanCnpj}&token=${INFOSIMPLES_CONFIG.token}`
  );

  if (!response.ok) {
    throw new Error(`InfoSimples CNPJ error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'CNPJ consultation failed');
  }

  return {
    cnpj: data.data[0]?.cnpj,
    razao_social: data.data[0]?.razao_social,
    nome_fantasia: data.data[0]?.nome_fantasia,
    situacao_cadastral: data.data[0]?.situacao_cadastral,
    data_situacao_cadastral: data.data[0]?.data_situacao_cadastral,
    natureza_juridica: data.data[0]?.natureza_juridica,
    porte: data.data[0]?.porte,
    capital_social: data.data[0]?.capital_social,
    endereco: {
      logradouro: data.data[0]?.logradouro,
      numero: data.data[0]?.numero,
      complemento: data.data[0]?.complemento,
      bairro: data.data[0]?.bairro,
      municipio: data.data[0]?.municipio,
      uf: data.data[0]?.uf,
      cep: data.data[0]?.cep,
    },
    atividade_principal: data.data[0]?.atividade_principal,
    atividades_secundarias: data.data[0]?.atividades_secundarias,
    socios: data.data[0]?.qsa,
    simples_nacional: data.data[0]?.simples_nacional,
    simei: data.data[0]?.simei,
  };
}

async function consultaCPF(cpf: string) {
  const cleanCpf = cpf.replace(/\D/g, '');

  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/receita-federal/cpf?cpf=${cleanCpf}&token=${INFOSIMPLES_CONFIG.token}`
  );

  if (!response.ok) {
    throw new Error(`InfoSimples CPF error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'CPF consultation failed');
  }

  return {
    cpf: data.data[0]?.cpf,
    nome: data.data[0]?.nome,
    data_nascimento: data.data[0]?.data_nascimento,
    situacao_cadastral: data.data[0]?.situacao_cadastral,
    digito_verificador: data.data[0]?.digito_verificador,
    comprovante_emitido: data.data[0]?.comprovante_emitido,
  };
}

async function consultaCRM(crm: string, uf: string) {
  if (!uf) {
    throw new Error('UF is required for CRM consultation');
  }

  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/cfm/crm?crm=${crm}&uf=${uf}&token=${INFOSIMPLES_CONFIG.token}`
  );

  if (!response.ok) {
    throw new Error(`InfoSimples CRM error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'CRM consultation failed');
  }

  return {
    crm: data.data[0]?.crm,
    uf: data.data[0]?.uf,
    nome: data.data[0]?.nome,
    situacao: data.data[0]?.situacao,
    especialidades: data.data[0]?.especialidades,
    data_inscricao: data.data[0]?.data_inscricao,
    endereco: data.data[0]?.endereco,
  };
}

async function consultaANVISA(registro: string) {
  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/anvisa/produto?registro=${registro}&token=${INFOSIMPLES_CONFIG.token}`
  );

  if (!response.ok) {
    throw new Error(`InfoSimples ANVISA error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'ANVISA consultation failed');
  }

  return {
    registro: data.data[0]?.registro,
    nome_produto: data.data[0]?.nome_produto,
    nome_tecnico: data.data[0]?.nome_tecnico,
    classe_risco: data.data[0]?.classe_risco,
    situacao: data.data[0]?.situacao,
    data_publicacao: data.data[0]?.data_publicacao,
    validade: data.data[0]?.validade,
    empresa_detentora: data.data[0]?.empresa_detentora,
    cnpj_detentora: data.data[0]?.cnpj_detentora,
    fabricante: data.data[0]?.fabricante,
    pais_fabricante: data.data[0]?.pais_fabricante,
  };
}

async function consultaCEP(cep: string) {
  const cleanCep = cep.replace(/\D/g, '');

  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/correios/cep?cep=${cleanCep}&token=${INFOSIMPLES_CONFIG.token}`
  );

  if (!response.ok) {
    throw new Error(`InfoSimples CEP error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'CEP consultation failed');
  }

  return {
    cep: data.data[0]?.cep,
    logradouro: data.data[0]?.logradouro,
    complemento: data.data[0]?.complemento,
    bairro: data.data[0]?.bairro,
    cidade: data.data[0]?.cidade,
    uf: data.data[0]?.uf,
    ibge: data.data[0]?.ibge,
  };
}

// ============================================================================
// PLUGGY INTEGRATIONS
// ============================================================================

async function getPluggyAccessToken(): Promise<string> {
  const response = await fetch(`${PLUGGY_CONFIG.baseUrl}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: PLUGGY_CONFIG.clientId,
      clientSecret: PLUGGY_CONFIG.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Pluggy authentication failed');
  }

  const data = await response.json();
  return data.apiKey;
}

async function pluggyCreateConnect(
  empresaId: string,
  options?: Record<string, unknown>
): Promise<{ connectToken: string }> {
  const accessToken = await getPluggyAccessToken();

  const response = await fetch(`${PLUGGY_CONFIG.baseUrl}/connect_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': accessToken,
    },
    body: JSON.stringify({
      clientUserId: empresaId,
      options: {
        webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pluggy-webhook`,
        ...options,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Pluggy connect token creation failed');
  }

  const data = await response.json();
  return { connectToken: data.accessToken };
}

async function pluggySync(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  itemId: string
): Promise<{ synced: boolean; transactions: number }> {
  const accessToken = await getPluggyAccessToken();

  // Get item info
  const itemResponse = await fetch(`${PLUGGY_CONFIG.baseUrl}/items/${itemId}`, {
    headers: { 'X-API-KEY': accessToken },
  });

  if (!itemResponse.ok) {
    throw new Error('Failed to fetch Pluggy item');
  }

  const item = await itemResponse.json();

  // Update conta_bancaria
  await supabase
    .from('contas_bancarias')
    .update({
      pluggy_status: item.status,
      pluggy_last_sync: new Date().toISOString(),
      saldo_disponivel: item.accounts?.[0]?.balance || 0,
    })
    .eq('pluggy_item_id', itemId)
    .eq('empresa_id', empresaId);

  // Fetch transactions
  const transResponse = await fetch(
    `${PLUGGY_CONFIG.baseUrl}/transactions?itemId=${itemId}&pageSize=500`,
    { headers: { 'X-API-KEY': accessToken } }
  );

  if (!transResponse.ok) {
    throw new Error('Failed to fetch Pluggy transactions');
  }

  const transData = await transResponse.json();
  const transactions = transData.results || [];

  // Get conta_bancaria_id
  const { data: conta } = await supabase
    .from('contas_bancarias')
    .select('id')
    .eq('pluggy_item_id', itemId)
    .single();

  if (!conta) {
    throw new Error('Bank account not found');
  }

  // Upsert transactions
  for (const trans of transactions) {
    await supabase.from('transacoes_bancarias').upsert(
      {
        empresa_id: empresaId,
        conta_bancaria_id: conta.id,
        pluggy_transaction_id: trans.id,
        data_transacao: trans.date,
        descricao: trans.description,
        descricao_original: trans.descriptionRaw,
        valor: trans.amount,
        tipo: trans.type === 'CREDIT' ? 'credito' : 'debito',
        categoria: trans.category,
        is_tarifa: trans.category?.includes('BANK_FEE') || false,
        pluggy_metadata: {
          merchantName: trans.merchantName,
          paymentData: trans.paymentData,
          creditCardMetadata: trans.creditCardMetadata,
        },
      },
      { onConflict: 'pluggy_transaction_id' }
    );
  }

  return {
    synced: true,
    transactions: transactions.length,
  };
}

// ============================================================================
// NF-e EMISSION
// ============================================================================

async function emitirNFe(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  faturaId: string
): Promise<{ chave_acesso: string; protocolo: string }> {
  // Get fatura and items
  const { data: fatura } = await supabase
    .from('faturas')
    .select(`
      *,
      cliente:clientes(*),
      itens:fatura_itens(*, produto:produtos(*))
    `)
    .eq('id', faturaId)
    .eq('empresa_id', empresaId)
    .single();

  if (!fatura) {
    throw new Error('Fatura not found');
  }

  // Build NF-e XML (simplified - real implementation would use a proper library)
  const nfeData = {
    emitente: { cnpj: Deno.env.get('EMPRESA_CNPJ') },
    destinatario: {
      cnpj: fatura.cliente.cpf_cnpj,
      razao_social: fatura.cliente.razao_social || fatura.cliente.nome,
      endereco: fatura.cliente,
    },
    itens: fatura.itens.map((item: any, index: number) => ({
      numero: index + 1,
      codigo: item.produto.codigo,
      descricao: item.descricao || item.produto.nome,
      ncm: item.produto.ncm,
      cfop: '5102', // Venda de mercadoria
      quantidade: item.quantidade,
      valor_unitario: item.preco_unitario,
      valor_total: item.preco_total,
    })),
    valores: {
      produtos: fatura.valor_bruto,
      desconto: fatura.valor_desconto,
      total: fatura.valor_liquido,
    },
  };

  // Call InfoSimples NFe API
  const response = await fetch(
    `${INFOSIMPLES_CONFIG.baseUrl}/consultas/sefaz/nfe/emitir`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INFOSIMPLES_CONFIG.token}`,
      },
      body: JSON.stringify(nfeData),
    }
  );

  if (!response.ok) {
    throw new Error('NF-e emission failed');
  }

  const result = await response.json();

  // Update NF-e record
  await supabase.from('nfes').insert({
    empresa_id: empresaId,
    fatura_id: faturaId,
    cliente_id: fatura.cliente_id,
    numero: result.numero,
    serie: result.serie,
    chave_acesso: result.chave_acesso,
    status: 'autorizada',
    valor_produtos: fatura.valor_bruto,
    valor_desconto: fatura.valor_desconto,
    valor_total: fatura.valor_liquido,
    protocolo_autorizacao: result.protocolo,
    data_autorizacao: new Date().toISOString(),
    xml_url: result.xml_url,
    danfe_url: result.danfe_url,
    infosimples_request_id: result.request_id,
    infosimples_response: result,
  });

  // Update fatura
  await supabase.from('faturas').update({ nfe_id: result.chave_acesso }).eq('id', faturaId);

  return {
    chave_acesso: result.chave_acesso,
    protocolo: result.protocolo,
  };
}

// ============================================================================
// CACHE & RATE LIMITING
// ============================================================================

async function getCachedResult(
  supabase: ReturnType<typeof createClient>,
  tipo: string,
  identificador: string
): Promise<unknown | null> {
  const { data } = await supabase
    .from('infosimples_cache')
    .select('dados')
    .eq('tipo_consulta', tipo)
    .eq('identificador', identificador)
    .gt('expira_em', new Date().toISOString())
    .single();

  return data?.dados || null;
}

async function cacheResult(
  supabase: ReturnType<typeof createClient>,
  tipo: string,
  identificador: string,
  dados: unknown,
  empresaId: string
): Promise<void> {
  const ttl = CACHE_TTL[tipo as keyof typeof CACHE_TTL] || 86400;
  const expiraEm = new Date(Date.now() + ttl * 1000).toISOString();

  await supabase.from('infosimples_cache').upsert(
    {
      tipo_consulta: tipo,
      identificador,
      dados,
      empresa_id: empresaId,
      sucesso: true,
      consultado_em: new Date().toISOString(),
      expira_em: expiraEm,
    },
    { onConflict: 'tipo_consulta,identificador' }
  );
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  empresaId: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  const { count } = await supabase
    .from('infosimples_log')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .gte('criado_em', oneHourAgo);

  return (count || 0) < 100;
}

async function logRequest(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  tipo: string,
  identificador: string,
  sucesso: boolean,
  creditos: number
): Promise<void> {
  await supabase.from('infosimples_log').insert({
    empresa_id: empresaId,
    endpoint: tipo,
    parametros: { identificador },
    status_code: sucesso ? 200 : 500,
    creditos_consumidos: creditos,
  });
}
