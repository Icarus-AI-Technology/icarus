/**
 * ICARUS v5.0 - Módulos Financeiros
 * 
 * Exporta todos os componentes do módulo financeiro.
 */

export { ContasPagar } from './ContasPagar'
export { ContasReceber } from './ContasReceber'
export { FinanceiroAvancadoCompleto } from './FinanceiroAvancadoCompleto'
export { FluxoCaixaIA } from './FluxoCaixaIA'
export { GestaoFiscal } from './GestaoFiscal'

// Re-export default para compatibilidade
export { default as ContasPagarModule } from './ContasPagar'
export { default as ContasReceberModule } from './ContasReceber'
export { default as FinanceiroAvancadoCompletoModule } from './FinanceiroAvancadoCompleto'
export { default as FluxoCaixaIAModule } from './FluxoCaixaIA'
export { default as GestaoFiscalModule } from './GestaoFiscal'

