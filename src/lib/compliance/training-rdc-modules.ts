/**
 * ICARUS v5.0 - Módulos de Treinamento RDC/ANVISA
 * 
 * Módulos de treinamento baseados em:
 * - RDC 665/2022 (Boas Práticas de Fabricação e Distribuição)
 * - Controle de Documentos e Registros
 * - Recebimento, Inspeção e Armazenamento
 * - Rastreabilidade de Produtos para Saúde
 * - Manual de Boas Práticas para Distribuidores
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { TrainingModule, TrainingCategory } from './training-certification'

// ============ MÓDULOS DE TREINAMENTO ANVISA ============

export const ANVISA_TRAINING_MODULES: TrainingModule[] = [
  // MÓDULO 1: Controle de Documentos e Registros
  {
    id: 'controle_documentos_rdc665',
    title: 'Controle de Documentos e Registros - RDC 665/2022',
    description: 'Sistemática para elaboração, aprovação, distribuição e controle de documentos e registros do Sistema de Gestão da Qualidade',
    category: 'codigo_etica' as TrainingCategory,
    duration: 45,
    order: 10,
    isRequired: true,
    validityMonths: 12,
    passingScore: 70,
    content: [
      {
        id: 'intro_sgq',
        type: 'text',
        title: 'Sistema de Gestão da Qualidade',
        content: `
# Sistema de Gestão da Qualidade (SGQ)

O Sistema de Gestão da Qualidade é o conjunto de elementos inter-relacionados que estabelecem políticas e objetivos, e os processos para alcançar esses objetivos.

## Base Legal

A **RDC 665/2022** da ANVISA estabelece os requisitos de Boas Práticas de Fabricação e Distribuição de Produtos Médicos, incluindo os requisitos de documentação.

## Objetivos do SGQ

1. **Garantir a Qualidade**: Assegurar que produtos médicos sejam seguros e eficazes
2. **Conformidade Regulatória**: Atender às exigências da ANVISA e demais órgãos
3. **Rastreabilidade**: Permitir rastrear todas as atividades e decisões
4. **Melhoria Contínua**: Identificar oportunidades de melhoria

## Estrutura Documental

A estrutura documental do SGQ é organizada em níveis:

### Nível 1 - Manual da Qualidade
- Política da Qualidade
- Objetivos da Qualidade
- Escopo do SGQ
- Interação entre processos

### Nível 2 - Procedimentos Operacionais Padrão (POP)
- Descrevem O QUE fazer
- Quem é responsável
- Quando executar
- Onde executar

### Nível 3 - Instruções de Trabalho (IT)
- Descrevem COMO fazer
- Passo a passo detalhado
- Critérios de aceitação

### Nível 4 - Formulários e Registros
- Evidências de execução
- Dados para análise
- Base para rastreabilidade
        `,
      },
      {
        id: 'controle_docs',
        type: 'text',
        title: 'Controle de Documentos',
        content: `
# Controle de Documentos

## Requisitos da RDC 665/2022

A norma exige que a organização estabeleça procedimentos documentados para:

### 1. Aprovação de Documentos
- Documentos devem ser analisados e aprovados antes da emissão
- Aprovadores devem ter competência e autoridade definidas
- Registro da aprovação (assinatura, data)

### 2. Análise Crítica e Atualização
- Revisar documentos quando necessário
- Garantir que alterações sejam identificadas
- Re-aprovar documentos atualizados

### 3. Identificação de Alterações
- Identificar claramente o que foi alterado
- Manter histórico de revisões
- Controlar versões

### 4. Disponibilidade
- Versões pertinentes disponíveis nos pontos de uso
- Acesso controlado conforme necessidade
- Distribuição controlada

### 5. Legibilidade e Identificação
- Documentos devem ser legíveis
- Facilmente identificáveis
- Código único de identificação

### 6. Documentos Externos
- Identificar documentos de origem externa
- Controlar sua distribuição
- Manter atualizados

### 7. Documentos Obsoletos
- Prevenir uso não intencional
- Identificar claramente se retidos
- Segregar de documentos vigentes

## Codificação de Documentos

Exemplo de codificação:

| Tipo | Código | Exemplo |
|------|--------|---------|
| Manual da Qualidade | MQ | MQ-001 |
| Procedimento Operacional | POP | POP-QUA-001 |
| Instrução de Trabalho | IT | IT-REC-001 |
| Formulário | FOR | FOR-EST-001 |
        `,
      },
      {
        id: 'controle_registros',
        type: 'text',
        title: 'Controle de Registros',
        content: `
# Controle de Registros

## Definição

Registros são documentos que apresentam resultados obtidos ou fornecem evidências de atividades realizadas.

## Requisitos da RDC 665/2022

### 1. Identificação
- Título do registro
- Código de identificação
- Versão/revisão
- Data de emissão

### 2. Armazenamento
- Local definido e adequado
- Proteção contra danos
- Acesso controlado
- Condições ambientais adequadas

### 3. Proteção
- Backup de registros eletrônicos
- Proteção contra alterações não autorizadas
- Confidencialidade quando aplicável

### 4. Recuperação
- Sistema de indexação
- Facilidade de localização
- Tempo de resposta definido

### 5. Retenção
- Tempo mínimo: **5 anos após a data de validade do produto**
- Ou conforme requisitos regulatórios específicos
- Tabela de temporalidade documentada

### 6. Disposição
- Método de descarte definido
- Registro de descarte
- Confidencialidade na destruição

## Tipos de Registros

| Tipo | Exemplos | Tempo Retenção |
|------|----------|----------------|
| Rastreabilidade | Registros de lote, distribuição | 5 anos + validade |
| Reclamações | Registros de reclamação, CAPA | 5 anos + validade |
| Treinamento | Certificados, listas de presença | Vigência do colaborador + 5 anos |
| Calibração | Certificados, registros | 5 anos |
| Auditoria | Relatórios, planos de ação | 5 anos |
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_docs',
        question: 'Segundo a RDC 665/2022, qual é o tempo mínimo de retenção de registros de rastreabilidade?',
        type: 'single',
        options: [
          { id: 'a', text: '2 anos após a fabricação', isCorrect: false },
          { id: 'b', text: '3 anos após a distribuição', isCorrect: false },
          { id: 'c', text: '5 anos após a data de validade do produto', isCorrect: true },
          { id: 'd', text: '10 anos após a fabricação', isCorrect: false },
        ],
        explanation: 'A RDC 665/2022 estabelece que registros devem ser mantidos por no mínimo 5 anos após a data de validade do produto.',
        points: 10,
      },
      {
        id: 'q2_docs',
        question: 'O que deve ser feito com documentos obsoletos segundo as Boas Práticas?',
        type: 'single',
        options: [
          { id: 'a', text: 'Destruir imediatamente', isCorrect: false },
          { id: 'b', text: 'Manter junto aos documentos vigentes', isCorrect: false },
          { id: 'c', text: 'Identificar claramente e segregar para prevenir uso não intencional', isCorrect: true },
          { id: 'd', text: 'Arquivar sem identificação especial', isCorrect: false },
        ],
        explanation: 'Documentos obsoletos devem ser identificados e segregados para prevenir uso não intencional. Podem ser retidos para fins legais ou preservação do conhecimento.',
        points: 10,
      },
      {
        id: 'q3_docs',
        question: 'Quais são os níveis da estrutura documental do SGQ?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Manual da Qualidade', isCorrect: true },
          { id: 'b', text: 'Procedimentos Operacionais Padrão', isCorrect: true },
          { id: 'c', text: 'Relatórios Gerenciais', isCorrect: false },
          { id: 'd', text: 'Instruções de Trabalho', isCorrect: true },
        ],
        explanation: 'A estrutura documental inclui: Manual da Qualidade, POPs, Instruções de Trabalho e Formulários/Registros.',
        points: 15,
      },
      {
        id: 'q4_docs',
        question: 'Antes de emitir um documento do SGQ, o que é obrigatório?',
        type: 'single',
        options: [
          { id: 'a', text: 'Publicar na intranet', isCorrect: false },
          { id: 'b', text: 'Análise e aprovação por pessoal autorizado', isCorrect: true },
          { id: 'c', text: 'Tradução para inglês', isCorrect: false },
          { id: 'd', text: 'Envio para a ANVISA', isCorrect: false },
        ],
        explanation: 'Documentos devem ser analisados e aprovados por pessoal autorizado antes da emissão, com registro da aprovação.',
        points: 10,
      },
    ],
  },

  // MÓDULO 2: Recebimento, Inspeção e Armazenamento
  {
    id: 'recebimento_inspecao_armazenamento',
    title: 'Recebimento, Inspeção e Armazenamento',
    description: 'Procedimentos para garantir que produtos recebidos atendam às especificações e sejam armazenados adequadamente',
    category: 'codigo_etica' as TrainingCategory,
    duration: 60,
    order: 11,
    isRequired: true,
    validityMonths: 12,
    passingScore: 70,
    content: [
      {
        id: 'recebimento',
        type: 'text',
        title: 'Processo de Recebimento',
        content: `
# Recebimento de Produtos

## Objetivo

Garantir que todos os produtos recebidos sejam verificados quanto à conformidade com os requisitos especificados antes de serem liberados para armazenamento.

## Etapas do Recebimento

### 1. Verificação Documental
- Nota Fiscal (conferir dados do emitente, destinatário, produtos)
- Conhecimento de Transporte
- Certificado de Análise (quando aplicável)
- Registro de temperatura durante transporte (quando aplicável)

### 2. Verificação Física da Carga
- Condições do veículo de transporte
- Integridade das embalagens de transporte
- Temperatura do compartimento de carga (se aplicável)
- Presença de pragas ou contaminantes

### 3. Conferência Quantitativa
- Quantidade de volumes
- Quantidade de unidades por volume
- Conferência com pedido de compra
- Registro de divergências

### 4. Identificação do Produto
- Código do produto
- Descrição
- Número do lote
- Data de fabricação
- Data de validade
- Registro ANVISA

## Critérios de Aceitação

| Critério | Requisito |
|----------|-----------|
| Documentação | Completa e legível |
| Embalagem | Íntegra, sem danos |
| Identificação | Clara e completa |
| Validade | Mínimo 6 meses (ou conforme acordo) |
| Temperatura | Conforme especificação do produto |
| Quantidade | Conforme pedido (tolerância ±2%) |
        `,
      },
      {
        id: 'inspecao',
        type: 'text',
        title: 'Inspeção de Produtos',
        content: `
# Inspeção de Produtos

## Tipos de Inspeção

### Inspeção Visual
- Integridade da embalagem primária
- Presença de todas as identificações
- Ausência de danos visíveis
- Conformidade com especificações

### Inspeção Documental
- Certificado de Análise
- Registro ANVISA válido
- Instruções de uso (quando aplicável)
- Laudos técnicos

### Inspeção por Amostragem
- Quando aplicável, seguir plano de amostragem
- Registrar amostras coletadas
- Manter rastreabilidade

## Não Conformidades no Recebimento

### Ações Imediatas
1. **Segregar** o produto não conforme
2. **Identificar** claramente como "PRODUTO BLOQUEADO"
3. **Registrar** a não conformidade
4. **Comunicar** ao fornecedor
5. **Aguardar** decisão sobre disposição

### Disposição de Produtos Não Conformes
- Devolução ao fornecedor
- Descarte (se não recuperável)
- Liberação condicional (com aprovação documentada)

## Registro de Recebimento

O registro deve conter:
- Data e hora do recebimento
- Identificação do produto (código, lote, validade)
- Quantidade recebida
- Fornecedor/Transportadora
- Condições de transporte
- Resultado da inspeção
- Responsável pelo recebimento
- Status: APROVADO / REPROVADO / QUARENTENA
        `,
      },
      {
        id: 'armazenamento',
        type: 'text',
        title: 'Armazenamento de Produtos',
        content: `
# Armazenamento de Produtos

## Requisitos das Instalações

### Infraestrutura
- Piso impermeável, lavável e resistente
- Paredes lisas e laváveis
- Iluminação adequada
- Ventilação apropriada
- Proteção contra pragas

### Áreas Definidas
1. **Recebimento**: Área para descarga e conferência
2. **Quarentena**: Produtos aguardando liberação
3. **Aprovados**: Produtos liberados para comercialização
4. **Reprovados/Devoluções**: Produtos segregados
5. **Expedição**: Área para separação e embarque

## Condições de Armazenamento

### Temperatura
- **Ambiente**: 15°C a 30°C (ou conforme especificação)
- **Refrigerado**: 2°C a 8°C
- **Congelado**: -20°C ou inferior

### Umidade
- Geralmente: 40% a 70% UR
- Conforme especificação do produto

### Monitoramento
- Registros de temperatura/umidade
- Frequência mínima: 2x ao dia (manhã e tarde)
- Calibração de instrumentos
- Alertas para desvios

## Sistema FEFO

**F**irst **E**xpired, **F**irst **O**ut

- Produtos com validade mais próxima devem ser expedidos primeiro
- Organização do estoque por data de validade
- Identificação visual (etiquetas coloridas, sinalização)
- Verificação periódica de validades

## Distâncias Mínimas

| Local | Distância |
|-------|-----------|
| Piso | 10 cm |
| Paredes | 10 cm |
| Teto | 50 cm |
| Entre paletes | 5 cm |

## Empilhamento

- Respeitar limite de empilhamento da embalagem
- Produtos mais pesados embaixo
- Não exceder capacidade das prateleiras
- Manter estabilidade da pilha
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_rec',
        question: 'Qual a validade mínima recomendada para aceitar produtos no recebimento?',
        type: 'single',
        options: [
          { id: 'a', text: '3 meses', isCorrect: false },
          { id: 'b', text: '6 meses', isCorrect: true },
          { id: 'c', text: '12 meses', isCorrect: false },
          { id: 'd', text: 'Qualquer validade é aceita', isCorrect: false },
        ],
        explanation: 'Recomenda-se aceitar produtos com validade mínima de 6 meses para garantir tempo adequado de comercialização.',
        points: 10,
      },
      {
        id: 'q2_rec',
        question: 'O que significa FEFO?',
        type: 'single',
        options: [
          { id: 'a', text: 'First Entry, First Out', isCorrect: false },
          { id: 'b', text: 'First Expired, First Out', isCorrect: true },
          { id: 'c', text: 'Fast Expiry, Fast Output', isCorrect: false },
          { id: 'd', text: 'Final Entry, Final Output', isCorrect: false },
        ],
        explanation: 'FEFO (First Expired, First Out) significa que produtos com validade mais próxima devem ser expedidos primeiro.',
        points: 10,
      },
      {
        id: 'q3_rec',
        question: 'Qual a distância mínima recomendada entre produtos e o piso?',
        type: 'single',
        options: [
          { id: 'a', text: '5 cm', isCorrect: false },
          { id: 'b', text: '10 cm', isCorrect: true },
          { id: 'c', text: '20 cm', isCorrect: false },
          { id: 'd', text: '50 cm', isCorrect: false },
        ],
        explanation: 'A distância mínima recomendada do piso é 10 cm para permitir limpeza e evitar contaminação.',
        points: 10,
      },
      {
        id: 'q4_rec',
        question: 'O que deve ser feito imediatamente ao identificar uma não conformidade no recebimento?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Segregar o produto', isCorrect: true },
          { id: 'b', text: 'Identificar como "PRODUTO BLOQUEADO"', isCorrect: true },
          { id: 'c', text: 'Descartar imediatamente', isCorrect: false },
          { id: 'd', text: 'Registrar a não conformidade', isCorrect: true },
        ],
        explanation: 'Ao identificar NC, deve-se segregar, identificar claramente e registrar. O descarte só ocorre após análise e decisão documentada.',
        points: 15,
      },
      {
        id: 'q5_rec',
        question: 'Com que frequência mínima deve ser feito o monitoramento de temperatura em áreas de armazenamento?',
        type: 'single',
        options: [
          { id: 'a', text: '1x ao dia', isCorrect: false },
          { id: 'b', text: '2x ao dia (manhã e tarde)', isCorrect: true },
          { id: 'c', text: '1x por semana', isCorrect: false },
          { id: 'd', text: 'Apenas quando houver recebimento', isCorrect: false },
        ],
        explanation: 'O monitoramento deve ser feito no mínimo 2 vezes ao dia (manhã e tarde) para garantir controle adequado.',
        points: 10,
      },
    ],
  },

  // MÓDULO 3: Rastreabilidade
  {
    id: 'rastreabilidade_produtos_saude',
    title: 'Rastreabilidade de Produtos para Saúde',
    description: 'Sistema de rastreabilidade para localização e histórico completo de produtos em toda a cadeia',
    category: 'codigo_etica' as TrainingCategory,
    duration: 50,
    order: 12,
    isRequired: true,
    validityMonths: 12,
    passingScore: 70,
    content: [
      {
        id: 'conceitos_rastreabilidade',
        type: 'text',
        title: 'Conceitos de Rastreabilidade',
        content: `
# Rastreabilidade de Produtos para Saúde

## Definição

Rastreabilidade é a capacidade de rastrear o histórico, a aplicação ou a localização de um item por meio de informações registradas.

## Base Legal

- **RDC 665/2022**: Requisitos de rastreabilidade para produtos médicos
- **Lei 6.360/1976**: Vigilância sanitária de produtos para saúde
- **RDC 36/2013**: Boas práticas em serviços de saúde

## Tipos de Rastreabilidade

### Rastreabilidade Ascendente (Backward)
- Do produto final até a matéria-prima
- Identificar origem de componentes
- Localizar fornecedores

### Rastreabilidade Descendente (Forward)
- Da matéria-prima até o produto final
- Identificar destino dos produtos
- Localizar clientes/pacientes

## Importância

1. **Segurança do Paciente**: Identificar rapidamente produtos com problemas
2. **Recall Eficiente**: Localizar e recolher produtos defeituosos
3. **Investigação de Eventos Adversos**: Rastrear causa de problemas
4. **Conformidade Regulatória**: Atender exigências da ANVISA
5. **Gestão de Qualidade**: Identificar pontos de melhoria
        `,
      },
      {
        id: 'requisitos_rastreabilidade',
        type: 'text',
        title: 'Requisitos de Rastreabilidade',
        content: `
# Requisitos de Rastreabilidade

## Informações Obrigatórias

Todo produto para saúde deve ter:

| Informação | Descrição |
|------------|-----------|
| Fabricante/Importador | Nome e endereço |
| Código do Produto | Identificação única |
| Número do Lote | Identificação do lote de fabricação |
| Data de Fabricação | Quando foi produzido |
| Data de Validade | Até quando pode ser usado |
| Registro ANVISA | Número de registro válido |
| Número de Série | Para produtos implantáveis |

## Registros de Movimentação

Cada movimentação deve registrar:

### Entrada
- Data e hora
- Fornecedor
- Nota Fiscal
- Quantidade
- Lote e validade
- Responsável

### Saída
- Data e hora
- Cliente (hospital, clínica)
- Nota Fiscal
- Quantidade
- Lote e validade
- Responsável

### Implante (para dispositivos implantáveis)
- Data do procedimento
- Paciente (identificação)
- Médico responsável
- Hospital
- Número de série
- Procedimento realizado

## Tempo de Resposta

### Para Recall
- **Tempo máximo**: 24 horas para identificar 100% dos destinos
- Contato imediato com clientes afetados
- Registro de todas as ações

### Para Consultas
- Informações disponíveis em até 24 horas
- Sistema deve permitir consulta rápida
- Histórico completo acessível
        `,
      },
      {
        id: 'sistemas_identificacao',
        type: 'text',
        title: 'Sistemas de Identificação',
        content: `
# Sistemas de Identificação

## Código de Barras

### EAN-13 / UPC
- Identificação básica do produto
- 13 dígitos (EAN) ou 12 dígitos (UPC)
- Não inclui lote e validade

### GS1-128
- Inclui informações adicionais
- GTIN + Lote + Validade + Série
- Padrão para área da saúde

## DataMatrix (GS1)

- Código 2D de alta densidade
- Pode conter todas as informações obrigatórias
- Menor espaço necessário
- Padrão recomendado pela ANVISA

### Estrutura do DataMatrix
\`\`\`
(01) GTIN - Código do produto
(10) Lote
(17) Data de validade (AAMMDD)
(21) Número de série
\`\`\`

## RFID

### Vantagens
- Leitura sem linha de visão
- Múltiplas leituras simultâneas
- Maior capacidade de dados
- Rastreamento em tempo real

### Aplicações
- Instrumentais cirúrgicos
- Containers de transporte
- Produtos de alto valor
- Controle de estoque automatizado

## QR Code

- Código 2D de fácil leitura
- Pode direcionar para informações online
- Útil para rastreabilidade pelo paciente
- Complementar ao DataMatrix

## Boas Práticas de Identificação

1. **Redundância**: Usar mais de um sistema quando possível
2. **Legibilidade**: Garantir qualidade de impressão
3. **Posicionamento**: Local padronizado na embalagem
4. **Verificação**: Validar leitura antes da expedição
5. **Backup**: Manter identificação visual além do código
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_rast',
        question: 'Qual o tempo máximo para identificar 100% dos destinos em caso de recall?',
        type: 'single',
        options: [
          { id: 'a', text: '12 horas', isCorrect: false },
          { id: 'b', text: '24 horas', isCorrect: true },
          { id: 'c', text: '48 horas', isCorrect: false },
          { id: 'd', text: '72 horas', isCorrect: false },
        ],
        explanation: 'O tempo máximo para identificar todos os destinos em caso de recall é de 24 horas.',
        points: 10,
      },
      {
        id: 'q2_rast',
        question: 'O que é rastreabilidade ascendente (backward)?',
        type: 'single',
        options: [
          { id: 'a', text: 'Rastrear do produto final até a matéria-prima/fornecedor', isCorrect: true },
          { id: 'b', text: 'Rastrear da matéria-prima até o cliente final', isCorrect: false },
          { id: 'c', text: 'Rastrear apenas dentro do armazém', isCorrect: false },
          { id: 'd', text: 'Rastrear apenas produtos vencidos', isCorrect: false },
        ],
        explanation: 'Rastreabilidade ascendente (backward) é a capacidade de rastrear do produto final até sua origem (matéria-prima/fornecedor).',
        points: 10,
      },
      {
        id: 'q3_rast',
        question: 'Quais informações são obrigatórias para rastreabilidade de produtos para saúde?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Código do produto e número do lote', isCorrect: true },
          { id: 'b', text: 'Data de validade e registro ANVISA', isCorrect: true },
          { id: 'c', text: 'Preço de venda', isCorrect: false },
          { id: 'd', text: 'Identificação do fabricante', isCorrect: true },
        ],
        explanation: 'São obrigatórios: código, lote, validade, registro ANVISA, fabricante e número de série (quando aplicável). Preço não é requisito de rastreabilidade.',
        points: 15,
      },
      {
        id: 'q4_rast',
        question: 'Qual sistema de identificação é recomendado pela ANVISA para produtos médicos?',
        type: 'single',
        options: [
          { id: 'a', text: 'Apenas código de barras EAN-13', isCorrect: false },
          { id: 'b', text: 'DataMatrix (GS1)', isCorrect: true },
          { id: 'c', text: 'Apenas QR Code', isCorrect: false },
          { id: 'd', text: 'Identificação manual', isCorrect: false },
        ],
        explanation: 'O DataMatrix (GS1) é o padrão recomendado pela ANVISA por permitir incluir todas as informações obrigatórias em um código compacto.',
        points: 10,
      },
    ],
  },

  // MÓDULO 4: Manual de Boas Práticas RDC 665
  {
    id: 'manual_boas_praticas_rdc665',
    title: 'Manual de Boas Práticas - RDC 665/2022',
    description: 'Requisitos completos de Boas Práticas de Fabricação e Distribuição de Produtos Médicos',
    category: 'codigo_etica' as TrainingCategory,
    duration: 90,
    order: 13,
    isRequired: true,
    validityMonths: 12,
    passingScore: 70,
    content: [
      {
        id: 'visao_geral_rdc665',
        type: 'text',
        title: 'Visão Geral da RDC 665/2022',
        content: `
# RDC 665/2022 - Visão Geral

## Histórico

A RDC 665/2022 consolidou:
- **RDC 16/2013**: Boas Práticas de Fabricação de Produtos Médicos
- **IN 8/2013**: Distribuição e Armazenamento

## Vigência

- **Publicação**: 31 de março de 2022
- **Entrada em vigor**: 02 de maio de 2022

## Escopo de Aplicação

A norma se aplica a:
1. **Fabricantes** de produtos médicos
2. **Distribuidores** de produtos médicos
3. **Armazenadores** de produtos médicos
4. **Importadores** de produtos médicos

## Estrutura da Norma

### Capítulo I - Disposições Iniciais
- Objetivo e escopo
- Definições

### Capítulo II - Sistema de Gestão da Qualidade
- Requisitos gerais
- Requisitos de documentação

### Capítulo III - Responsabilidade da Direção
- Comprometimento
- Foco no cliente
- Política da qualidade
- Planejamento
- Responsabilidade e autoridade
- Representante da direção
- Comunicação interna
- Análise crítica

### Capítulo IV - Gestão de Recursos
- Provisão de recursos
- Recursos humanos
- Infraestrutura
- Ambiente de trabalho

### Capítulo V - Realização do Produto
- Planejamento
- Processos relacionados a clientes
- Projeto e desenvolvimento
- Aquisição
- Produção e prestação de serviço
- Controle de dispositivos de medição

### Capítulo VI - Medição, Análise e Melhoria
- Monitoramento e medição
- Controle de produto não conforme
- Análise de dados
- Melhoria

### Capítulo VII - Distribuição e Armazenamento
- Requisitos específicos para distribuidores
        `,
      },
      {
        id: 'sgq_requisitos',
        type: 'text',
        title: 'Sistema de Gestão da Qualidade',
        content: `
# Sistema de Gestão da Qualidade

## Requisitos Gerais

A organização deve:

### 1. Estabelecer o SGQ
- Definir processos necessários
- Determinar sequência e interação
- Definir critérios e métodos
- Assegurar recursos
- Monitorar e medir
- Implementar ações de melhoria

### 2. Documentar o SGQ
- Manual da Qualidade
- Procedimentos documentados
- Registros requeridos

## Procedimentos Documentados Obrigatórios

1. **Controle de Documentos**
2. **Controle de Registros**
3. **Auditoria Interna**
4. **Controle de Produto Não Conforme**
5. **Ação Corretiva**
6. **Ação Preventiva**

## Manual da Qualidade

Deve incluir:
- Escopo do SGQ
- Exclusões justificadas
- Procedimentos documentados ou referência
- Descrição da interação entre processos

## Controle de Documentos

Procedimento deve definir:
- Aprovação antes da emissão
- Análise crítica e atualização
- Identificação de alterações
- Disponibilidade nos pontos de uso
- Legibilidade e identificação
- Controle de documentos externos
- Prevenção de uso de obsoletos

## Controle de Registros

Procedimento deve definir:
- Identificação
- Armazenamento
- Proteção
- Recuperação
- Retenção
- Disposição
        `,
      },
      {
        id: 'distribuicao_armazenamento',
        type: 'text',
        title: 'Requisitos para Distribuidores',
        content: `
# Requisitos para Distribuidores

## Capítulo VII - RDC 665/2022

### Licenciamento
- Licença sanitária vigente
- Autorização de Funcionamento (AFE)
- Responsável Técnico habilitado

### Instalações

#### Áreas Obrigatórias
- Recebimento
- Armazenamento (por condição de temperatura)
- Quarentena
- Produtos reprovados/devoluções
- Expedição
- Administrativa

#### Requisitos das Áreas
- Dimensões adequadas ao volume
- Piso, paredes e teto laváveis
- Iluminação e ventilação adequadas
- Controle de pragas
- Segurança física

### Equipamentos
- Adequados às operações
- Calibrados/qualificados
- Manutenção preventiva
- Registros de uso

### Pessoal
- Qualificação adequada
- Treinamento documentado
- Descrições de cargo
- Responsabilidades definidas

### Operações

#### Recebimento
- Procedimento documentado
- Verificação de documentos
- Inspeção física
- Registro de recebimento

#### Armazenamento
- Condições controladas
- Monitoramento ambiental
- Sistema FEFO
- Segregação de produtos

#### Expedição
- Verificação antes do envio
- Documentação adequada
- Condições de transporte
- Rastreabilidade

### Reclamações e Devoluções
- Procedimento documentado
- Investigação de causas
- Ações corretivas
- Registros mantidos

### Recall
- Procedimento documentado
- Tempo de resposta definido
- Comunicação com ANVISA
- Registros de ações
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_bp',
        question: 'Qual RDC a 665/2022 consolidou?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'RDC 16/2013', isCorrect: true },
          { id: 'b', text: 'IN 8/2013', isCorrect: true },
          { id: 'c', text: 'RDC 430/2020', isCorrect: false },
          { id: 'd', text: 'RDC 59/2000', isCorrect: false },
        ],
        explanation: 'A RDC 665/2022 consolidou a RDC 16/2013 (BPF) e a IN 8/2013 (Distribuição e Armazenamento).',
        points: 15,
      },
      {
        id: 'q2_bp',
        question: 'Quantos procedimentos documentados são obrigatórios segundo a RDC 665/2022?',
        type: 'single',
        options: [
          { id: 'a', text: '4 procedimentos', isCorrect: false },
          { id: 'b', text: '6 procedimentos', isCorrect: true },
          { id: 'c', text: '8 procedimentos', isCorrect: false },
          { id: 'd', text: '10 procedimentos', isCorrect: false },
        ],
        explanation: 'São 6 procedimentos obrigatórios: Controle de Documentos, Controle de Registros, Auditoria Interna, Controle de Produto NC, Ação Corretiva e Ação Preventiva.',
        points: 10,
      },
      {
        id: 'q3_bp',
        question: 'O que o Manual da Qualidade deve incluir?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Escopo do SGQ', isCorrect: true },
          { id: 'b', text: 'Exclusões justificadas', isCorrect: true },
          { id: 'c', text: 'Lista de todos os funcionários', isCorrect: false },
          { id: 'd', text: 'Descrição da interação entre processos', isCorrect: true },
        ],
        explanation: 'O Manual deve incluir: escopo, exclusões justificadas, procedimentos ou referência a eles, e descrição da interação entre processos.',
        points: 15,
      },
      {
        id: 'q4_bp',
        question: 'Quais áreas são obrigatórias para um distribuidor de produtos médicos?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Recebimento e Expedição', isCorrect: true },
          { id: 'b', text: 'Quarentena', isCorrect: true },
          { id: 'c', text: 'Laboratório de análises', isCorrect: false },
          { id: 'd', text: 'Armazenamento', isCorrect: true },
        ],
        explanation: 'Distribuidores devem ter: Recebimento, Armazenamento, Quarentena, Produtos reprovados/devoluções, Expedição e Administrativa. Laboratório não é obrigatório.',
        points: 15,
      },
    ],
  },
]

// ============ FUNÇÕES AUXILIARES ============

/**
 * Obtém todos os módulos de treinamento ANVISA
 */
export function getAnvisaTrainingModules(): TrainingModule[] {
  return ANVISA_TRAINING_MODULES
}

/**
 * Obtém módulo por ID
 */
export function getAnvisaModuleById(moduleId: string): TrainingModule | undefined {
  return ANVISA_TRAINING_MODULES.find(m => m.id === moduleId)
}

/**
 * Obtém módulos obrigatórios
 */
export function getRequiredAnvisaModules(): TrainingModule[] {
  return ANVISA_TRAINING_MODULES.filter(m => m.isRequired)
}

/**
 * Calcula carga horária total
 */
export function getTotalTrainingHours(): number {
  return ANVISA_TRAINING_MODULES.reduce((total, m) => total + m.duration, 0) / 60
}

// ============ EXPORTS ============

export default {
  ANVISA_TRAINING_MODULES,
  getAnvisaTrainingModules,
  getAnvisaModuleById,
  getRequiredAnvisaModules,
  getTotalTrainingHours,
}

