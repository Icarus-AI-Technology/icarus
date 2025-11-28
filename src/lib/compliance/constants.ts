/**
 * ICARUS v5.0 - Compliance Constants
 * 
 * Constantes centralizadas para conformidade regulatória.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

// ============ ANVISA ============

export const ANVISA_PRODUCT_CLASSES = {
  I: { name: 'Classe I', risk: 'Baixo', examples: 'Instrumentos cirúrgicos não invasivos' },
  II: { name: 'Classe II', risk: 'Médio', examples: 'Equipamentos de diagnóstico' },
  III: { name: 'Classe III', risk: 'Alto', examples: 'Implantes ortopédicos' },
  IV: { name: 'Classe IV', risk: 'Máximo', examples: 'Dispositivos cardíacos implantáveis' }
} as const

export const ANVISA_REGULATIONS = {
  RDC_16_2013: {
    number: 'RDC 16/2013',
    title: 'Boas Práticas de Fabricação de Produtos Médicos',
    scope: 'Fabricantes e importadores',
    url: 'https://antigo.anvisa.gov.br/legislacao'
  },
  RDC_59_2000: {
    number: 'RDC 59/2000',
    title: 'Boas Práticas de Fabricação para Estabelecimentos',
    scope: 'Estabelecimentos de saúde',
    url: 'https://antigo.anvisa.gov.br/legislacao'
  },
  RDC_751_2022: {
    number: 'RDC 751/2022',
    title: 'Registro de Dispositivos Médicos',
    scope: 'Todos os dispositivos médicos',
    url: 'https://antigo.anvisa.gov.br/legislacao'
  },
  IN_94_2022: {
    number: 'IN 94/2022',
    title: 'Procedimentos para Registro e Cadastro',
    scope: 'Dispositivos médicos',
    url: 'https://antigo.anvisa.gov.br/legislacao'
  },
  RDC_665_2022: {
    number: 'RDC 665/2022',
    title: 'Tecnovigilância',
    scope: 'Monitoramento de eventos adversos',
    url: 'https://antigo.anvisa.gov.br/legislacao'
  }
} as const

export const ANVISA_DOCUMENT_TYPES = [
  'Registro de Produto',
  'Certificado de Boas Práticas',
  'Autorização de Funcionamento',
  'Licença de Importação',
  'Relatório de Tecnovigilância',
  'Certificado de Conformidade'
] as const

// ============ ISO 42001 AIMS ============

export const ISO_42001_CLAUSES = {
  4: {
    title: 'Contexto da Organização',
    subclauses: [
      '4.1 Entendendo a organização e seu contexto',
      '4.2 Entendendo as necessidades e expectativas das partes interessadas',
      '4.3 Determinando o escopo do sistema de gestão de IA',
      '4.4 Sistema de gestão de IA'
    ]
  },
  5: {
    title: 'Liderança',
    subclauses: [
      '5.1 Liderança e comprometimento',
      '5.2 Política de IA',
      '5.3 Papéis, responsabilidades e autoridades organizacionais'
    ]
  },
  6: {
    title: 'Planejamento',
    subclauses: [
      '6.1 Ações para abordar riscos e oportunidades',
      '6.2 Objetivos de IA e planejamento para alcançá-los',
      '6.3 Planejamento de mudanças'
    ]
  },
  7: {
    title: 'Apoio',
    subclauses: [
      '7.1 Recursos',
      '7.2 Competência',
      '7.3 Conscientização',
      '7.4 Comunicação',
      '7.5 Informação documentada'
    ]
  },
  8: {
    title: 'Operação',
    subclauses: [
      '8.1 Planejamento e controle operacional',
      '8.2 Avaliação de impacto de IA',
      '8.3 Tratamento de riscos de IA',
      '8.4 Recursos de IA'
    ]
  },
  9: {
    title: 'Avaliação de Desempenho',
    subclauses: [
      '9.1 Monitoramento, medição, análise e avaliação',
      '9.2 Auditoria interna',
      '9.3 Análise crítica pela direção'
    ]
  },
  10: {
    title: 'Melhoria',
    subclauses: [
      '10.1 Melhoria contínua',
      '10.2 Não conformidade e ação corretiva'
    ]
  }
} as const

export const ISO_42001_CONTROLS = [
  { id: 'A.1', name: 'Políticas de IA', category: 'Governança' },
  { id: 'A.2', name: 'Estrutura organizacional', category: 'Governança' },
  { id: 'A.3', name: 'Recursos humanos', category: 'Recursos' },
  { id: 'A.4', name: 'Ciclo de vida do sistema de IA', category: 'Operação' },
  { id: 'A.5', name: 'Dados para sistemas de IA', category: 'Dados' },
  { id: 'A.6', name: 'Informação para partes interessadas', category: 'Comunicação' },
  { id: 'A.7', name: 'Uso do sistema de IA', category: 'Operação' },
  { id: 'A.8', name: 'Terceiros', category: 'Fornecedores' },
  { id: 'A.9', name: 'Avaliação de impacto', category: 'Risco' },
  { id: 'A.10', name: 'Documentação', category: 'Documentação' }
] as const

// ============ LGPD ============

export const LGPD_LEGAL_BASES = [
  { id: 'consent', name: 'Consentimento', article: 'Art. 7º, I' },
  { id: 'legal_obligation', name: 'Obrigação legal', article: 'Art. 7º, II' },
  { id: 'public_policy', name: 'Políticas públicas', article: 'Art. 7º, III' },
  { id: 'research', name: 'Pesquisa', article: 'Art. 7º, IV' },
  { id: 'contract', name: 'Execução de contrato', article: 'Art. 7º, V' },
  { id: 'legal_process', name: 'Processo judicial', article: 'Art. 7º, VI' },
  { id: 'life_protection', name: 'Proteção da vida', article: 'Art. 7º, VII' },
  { id: 'health_protection', name: 'Tutela da saúde', article: 'Art. 7º, VIII' },
  { id: 'legitimate_interest', name: 'Interesse legítimo', article: 'Art. 7º, IX' },
  { id: 'credit_protection', name: 'Proteção ao crédito', article: 'Art. 7º, X' }
] as const

export const LGPD_DATA_SUBJECT_RIGHTS = [
  { id: 'confirmation', name: 'Confirmação de tratamento', article: 'Art. 18, I' },
  { id: 'access', name: 'Acesso aos dados', article: 'Art. 18, II' },
  { id: 'correction', name: 'Correção de dados', article: 'Art. 18, III' },
  { id: 'anonymization', name: 'Anonimização', article: 'Art. 18, IV' },
  { id: 'portability', name: 'Portabilidade', article: 'Art. 18, V' },
  { id: 'deletion', name: 'Eliminação', article: 'Art. 18, VI' },
  { id: 'sharing_info', name: 'Informação sobre compartilhamento', article: 'Art. 18, VII' },
  { id: 'consent_info', name: 'Informação sobre não consentimento', article: 'Art. 18, VIII' },
  { id: 'revocation', name: 'Revogação do consentimento', article: 'Art. 18, IX' }
] as const

export const LGPD_SENSITIVE_DATA_CATEGORIES = [
  'Origem racial ou étnica',
  'Convicção religiosa',
  'Opinião política',
  'Filiação sindical',
  'Dados de saúde',
  'Dados genéticos',
  'Dados biométricos',
  'Vida sexual',
  'Orientação sexual'
] as const

// ============ CFM/CRM ============

export const CFM_SPECIALTIES = [
  { code: '01', name: 'Acupuntura' },
  { code: '02', name: 'Alergia e Imunologia' },
  { code: '03', name: 'Anestesiologia' },
  { code: '04', name: 'Angiologia' },
  { code: '05', name: 'Cardiologia' },
  { code: '06', name: 'Cirurgia Cardiovascular' },
  { code: '07', name: 'Cirurgia da Mão' },
  { code: '08', name: 'Cirurgia de Cabeça e Pescoço' },
  { code: '09', name: 'Cirurgia do Aparelho Digestivo' },
  { code: '10', name: 'Cirurgia Geral' },
  { code: '11', name: 'Cirurgia Oncológica' },
  { code: '12', name: 'Cirurgia Pediátrica' },
  { code: '13', name: 'Cirurgia Plástica' },
  { code: '14', name: 'Cirurgia Torácica' },
  { code: '15', name: 'Cirurgia Vascular' },
  { code: '16', name: 'Clínica Médica' },
  { code: '17', name: 'Coloproctologia' },
  { code: '18', name: 'Dermatologia' },
  { code: '19', name: 'Endocrinologia e Metabologia' },
  { code: '20', name: 'Endoscopia' },
  { code: '21', name: 'Gastroenterologia' },
  { code: '22', name: 'Genética Médica' },
  { code: '23', name: 'Geriatria' },
  { code: '24', name: 'Ginecologia e Obstetrícia' },
  { code: '25', name: 'Hematologia e Hemoterapia' },
  { code: '26', name: 'Homeopatia' },
  { code: '27', name: 'Infectologia' },
  { code: '28', name: 'Mastologia' },
  { code: '29', name: 'Medicina de Emergência' },
  { code: '30', name: 'Medicina de Família e Comunidade' },
  { code: '31', name: 'Medicina do Trabalho' },
  { code: '32', name: 'Medicina do Tráfego' },
  { code: '33', name: 'Medicina Esportiva' },
  { code: '34', name: 'Medicina Física e Reabilitação' },
  { code: '35', name: 'Medicina Intensiva' },
  { code: '36', name: 'Medicina Legal e Perícia Médica' },
  { code: '37', name: 'Medicina Nuclear' },
  { code: '38', name: 'Medicina Preventiva e Social' },
  { code: '39', name: 'Nefrologia' },
  { code: '40', name: 'Neurocirurgia' },
  { code: '41', name: 'Neurologia' },
  { code: '42', name: 'Nutrologia' },
  { code: '43', name: 'Oftalmologia' },
  { code: '44', name: 'Oncologia Clínica' },
  { code: '45', name: 'Ortopedia e Traumatologia' },
  { code: '46', name: 'Otorrinolaringologia' },
  { code: '47', name: 'Patologia' },
  { code: '48', name: 'Patologia Clínica/Medicina Laboratorial' },
  { code: '49', name: 'Pediatria' },
  { code: '50', name: 'Pneumologia' },
  { code: '51', name: 'Psiquiatria' },
  { code: '52', name: 'Radiologia e Diagnóstico por Imagem' },
  { code: '53', name: 'Radioterapia' },
  { code: '54', name: 'Reumatologia' },
  { code: '55', name: 'Urologia' }
] as const

// ============ NCM ISENÇÕES ============

export const NCM_ISENCOES_OPME = [
  { ncm: '9021.10.10', description: 'Artigos e aparelhos ortopédicos' },
  { ncm: '9021.10.20', description: 'Artigos e aparelhos para fraturas' },
  { ncm: '9021.21.00', description: 'Dentes artificiais' },
  { ncm: '9021.29.00', description: 'Outros artigos de prótese dentária' },
  { ncm: '9021.31.10', description: 'Próteses articulares - Quadril' },
  { ncm: '9021.31.20', description: 'Próteses articulares - Joelho' },
  { ncm: '9021.31.90', description: 'Outras próteses articulares' },
  { ncm: '9021.39.11', description: 'Válvulas cardíacas' },
  { ncm: '9021.39.19', description: 'Outras próteses cardíacas' },
  { ncm: '9021.39.20', description: 'Próteses oculares' },
  { ncm: '9021.39.30', description: 'Próteses mamárias' },
  { ncm: '9021.39.40', description: 'Implantes cocleares' },
  { ncm: '9021.39.80', description: 'Outras próteses' },
  { ncm: '9021.39.91', description: 'Stents' },
  { ncm: '9021.39.99', description: 'Outros implantes' },
  { ncm: '9021.40.00', description: 'Aparelhos para surdez' },
  { ncm: '9021.50.00', description: 'Marca-passos cardíacos' },
  { ncm: '9021.90.11', description: 'Partes de artigos ortopédicos' },
  { ncm: '9021.90.19', description: 'Partes de próteses articulares' },
  { ncm: '9021.90.81', description: 'Partes de marca-passos' },
  { ncm: '9021.90.89', description: 'Partes de outras próteses' },
  { ncm: '9021.90.92', description: 'Partes de aparelhos de surdez' }
] as const

// ============ AUDIT TYPES ============

export const AUDIT_TYPES = {
  INTERNAL: { name: 'Auditoria Interna', frequency: 'Semestral' },
  EXTERNAL: { name: 'Auditoria Externa', frequency: 'Anual' },
  SURVEILLANCE: { name: 'Auditoria de Vigilância', frequency: 'Conforme necessidade' },
  CERTIFICATION: { name: 'Auditoria de Certificação', frequency: 'Trienal' },
  SUPPLIER: { name: 'Auditoria de Fornecedor', frequency: 'Conforme risco' }
} as const

// ============ COMPLIANCE STATUS ============

export const COMPLIANCE_STATUS = {
  COMPLIANT: { label: 'Conforme', color: 'green', score: 100 },
  PARTIAL: { label: 'Parcialmente Conforme', color: 'yellow', score: 70 },
  NON_COMPLIANT: { label: 'Não Conforme', color: 'red', score: 0 },
  NOT_APPLICABLE: { label: 'Não Aplicável', color: 'gray', score: null },
  PENDING: { label: 'Pendente', color: 'blue', score: null }
} as const

// ============ RISK LEVELS ============

export const RISK_LEVELS = {
  CRITICAL: { label: 'Crítico', color: 'red', priority: 1 },
  HIGH: { label: 'Alto', color: 'orange', priority: 2 },
  MEDIUM: { label: 'Médio', color: 'yellow', priority: 3 },
  LOW: { label: 'Baixo', color: 'green', priority: 4 }
} as const

