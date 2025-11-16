# ICARUS v5.0 - Lista Completa de Módulos

## Visão Geral

O ICARUS v5.0 possui **58 módulos integrados** que cobrem todas as áreas de um hospital. Abaixo está a lista completa organizada por categorias.

---

## 📋 Categorias e Módulos

### 🏥 ASSISTENCIAL (15 módulos)

1. **Atendimento Ambulatorial** - Consultas e retornos
2. **Pronto Socorro** - Emergências e urgências
3. **Internação** - Gestão de leitos e internações
4. **Centro Cirúrgico** - Agendamento e controle de cirurgias
5. **UTI/CTI** - Gestão de terapia intensiva
6. **Laboratório** - Exames laboratoriais
7. **Imagem e Diagnóstico** - Radiologia, tomografia, ressonância
8. **Farmácia Hospitalar** - Dispensação e controle
9. **Hemoterapia** - Banco de sangue
10. **Radioterapia** - Tratamentos oncológicos
11. **Quimioterapia** - Protocolos e aplicações
12. **Fisioterapia** - Sessões e evolução
13. **Nutrição** - Dietas e acompanhamento
14. **Enfermagem** - Prescrições e evolução
15. **Prontuário Eletrônico** - PEP completo

### 💼 ADMINISTRATIVO (10 módulos)

16. **Agendamento** - Consultas e exames
17. **Faturamento** - Convênios e particular
18. **Recepção** - Check-in e check-out
19. **Auditoria Médica** - Glosas e análises
20. **Ouvidoria** - SAC e reclamações
21. **Hotelaria Hospitalar** - Conforto e amenidades
22. **Transporte** - Ambulâncias e remoções
23. **Manutenção** - Predial e equipamentos
24. **Central de Leitos** - Regulação
25. **Cadastros** - Pacientes, convênios, médicos

### 💰 FINANCEIRO (8 módulos)

26. **Contas a Pagar** - Fornecedores
27. **Contas a Receber** - Convênios e pacientes
28. **Fluxo de Caixa** - Tesouraria
29. **Faturamento TISS** - Padrão ANS
30. **Glosas** - Gestão de negativas
31. **Contratos** - Convênios e fornecedores
32. **Custos Hospitalares** - ABC e rateio
33. **Orçamento** - Planejamento financeiro

### 📦 SUPRIMENTOS (8 módulos)

34. **Produtos** - Catálogo (já criado)
35. **Compras** - Cotações e pedidos
36. **Estoque** - Movimentações
37. **Almoxarifado** - Materiais
38. **Patrimônio** - Bens e equipamentos
39. **Fornecedores** - Cadastro e avaliação
40. **Requisições** - Solicitações internas
41. **Inventário** - Contagens e ajustes

### 👥 RECURSOS HUMANOS (7 módulos)

42. **Colaboradores** - Cadastro e dados
43. **Ponto Eletrônico** - Controle de jornada
44. **Folha de Pagamento** - Processamento
45. **Escalas** - Plantões e turnos
46. **Treinamentos** - Capacitações
47. **Avaliação de Desempenho** - Gestão por competências
48. **Benefícios** - VT, VR, plano de saúde

### ✅ QUALIDADE E REGULATÓRIO (5 módulos)

49. **Indicadores** - KPIs e metas
50. **Acreditação** - ONA, JCI
51. **CCIH** - Controle de infecção
52. **Farmacovigilância** - Eventos adversos
53. **Comissões** - Prontuários, óbitos, ética

### 📊 ANALYTICS E BI (5 módulos)

54. **Dashboard Executivo** - Visão geral
55. **Relatórios Gerenciais** - Consolidados
56. **Análise Preditiva** - IA e Machine Learning
57. **Benchmarking** - Comparações
58. **Business Intelligence** - Cubos e análises

---

## 📈 Status de Implementação

| Status | Quantidade | Descrição |
|--------|-----------|-----------|
| ✅ Completo | 1 | Produtos |
| 🔨 Em Desenvolvimento | 57 | A serem criados |
| **Total** | **58** | **Módulos** |

---

## 🎯 Priorização

### Fase 1 - Core Assistencial (5 módulos)
1. Prontuário Eletrônico
2. Atendimento Ambulatorial
3. Internação
4. Centro Cirúrgico
5. Laboratório

### Fase 2 - Core Financeiro (5 módulos)
1. Faturamento
2. Contas a Receber
3. Faturamento TISS
4. Glosas
5. Fluxo de Caixa

### Fase 3 - Core Suprimentos (5 módulos)
1. Produtos (✅ já criado)
2. Compras
3. Estoque
4. Almoxarifado
5. Fornecedores

### Fase 4 - Demais Módulos (43 módulos)
Implementação progressiva conforme demanda

---

## 🔧 Padrão de Nomenclatura

Todos os módulos seguem o padrão:

```
src/components/modules/[NomeDoModulo].tsx
docs/modulos/ICARUS-MOD-[NOME-MODULO].md
```

**Exemplos:**
- `src/components/modules/ProntuarioEletronico.tsx`
- `docs/modulos/ICARUS-MOD-PRONTUARIO-ELETRONICO.md`

---

## 📚 Documentação

Cada módulo possui:
- ✅ Arquivo `.tsx` com implementação completa
- ✅ Documentação `.md` detalhada
- ✅ 4-5 KPIs específicos
- ✅ 3-5 abas customizadas
- ✅ Integração Supabase
- ✅ (Opcional) Recursos de IA

---

**Última atualização**: 2025-11-16
**Versão**: 1.0.0
