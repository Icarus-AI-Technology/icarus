import React, { useEffect, useState } from 'react';
import { validateOraclusXCompliance, ValidationResult } from '@/lib/utils/oraclusx-validator';

/**
 * HardGateBanner - Componente de validação Hard Gate
 * 
 * Exibe banner de status da validação OraclusX DS
 * Valida automaticamente quando o componente é montado e em intervalos
 */
export const HardGateBanner: React.FC = () => {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🔴 DESABILITAR TEMPORARIAMENTE (modo não-bloqueante)
  const ENABLE_BLOCKING = false; // Mude para true para habilitar o bloqueio

  useEffect(() => {
    // Validar imediatamente
    const validate = () => {
      const validationResult = validateOraclusXCompliance();
      setResult(validationResult);
    };

    validate();

    // Validar apenas uma vez (não fica revalidando constantemente)
    // const interval = setInterval(validate, 5000);

    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  if (!result) {
    return null;
  }

  if (result.passed) {
    return (
      <div 
        className="fixed top-4 right-4 z-[9999] bg-[#10B981] text-white py-2 px-4 rounded-lg shadow-lg"
        style={{ fontSize: '0.875rem', fontWeight: 600 }}
      >
        ✅ ORX Gate: 100%
      </div>
    );
  }

  const errorCount = result.violations.filter(v => v.severity === 'error').length;
  const warningCount = result.violations.filter(v => v.severity === 'warning').length;

  // Modo não-bloqueante: banner pequeno no canto
  if (!ENABLE_BLOCKING) {
    return (
      <div 
        className={`fixed ${isCollapsed ? 'bottom-4' : 'top-4'} right-4 z-[9999] bg-[#EF4444] text-white rounded-lg shadow-lg max-w-md transition-all duration-300`}
        style={{ fontSize: '0.875rem' }}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span style={{ fontWeight: 600 }}>
            ⚠️ ORX: {errorCount} erros
          </span>
          <button className="hover:opacity-80">
            {isCollapsed ? '▲' : '▼'}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="px-3 pb-3 space-y-2" style={{ fontSize: '0.75rem' }}>
            <p className="opacity-90">
              {errorCount} erros, {warningCount} avisos
            </p>
            <p className="opacity-75">
              Modo não-bloqueante ativo. Corrija quando puder.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Modo bloqueante (desabilitado por padrão)
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#EF4444] text-white py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          🚨 ORX Gate: {errorCount} Erros, {warningCount} Avisos
        </h3>
        <ul style={{ fontSize: '0.875rem' }} className="space-y-1 max-h-40 overflow-y-auto">
          {result.violations.slice(0, 5).map((violation, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={violation.severity === 'error' ? 'text-red-200' : 'text-yellow-200'}>
                {violation.severity === 'error' ? '❌' : '⚠️'}
              </span>
              <span>{violation.message}</span>
            </li>
          ))}
          {result.violations.length > 5 && (
            <li style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              ... e mais {result.violations.length - 5} violações
            </li>
          )}
        </ul>
        <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.5rem' }}>
          A aplicação está bloqueada até correção das violações críticas.
        </p>
        <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
          Coverage: {result.coverage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

