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

  useEffect(() => {
    // Validar imediatamente
    const validate = () => {
      const validationResult = validateOraclusXCompliance();
      setResult(validationResult);
    };

    validate();

    // Validar a cada 5 segundos
    const interval = setInterval(validate, 5000);

    // Validar quando DOM muda
    const observer = new MutationObserver(validate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (!result) {
    return null;
  }

  if (result.passed) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#10B981] text-white py-2 px-4 text-center font-bold text-sm">
        ✅ ORX Gate: APROVADO - 100% Coverage
      </div>
    );
  }

  const errorCount = result.violations.filter(v => v.severity === 'error').length;
  const warningCount = result.violations.filter(v => v.severity === 'warning').length;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#EF4444] text-white py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <h3 className="font-bold text-lg mb-2">
          🚨 ORX Gate: REPROVADO - {errorCount} Erros, {warningCount} Avisos
        </h3>
        <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
          {result.violations.slice(0, 5).map((violation, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={violation.severity === 'error' ? 'text-red-200' : 'text-yellow-200'}>
                {violation.severity === 'error' ? '❌' : '⚠️'}
              </span>
              <span>{violation.message}</span>
            </li>
          ))}
          {result.violations.length > 5 && (
            <li className="text-xs opacity-90">
              ... e mais {result.violations.length - 5} violações
            </li>
          )}
        </ul>
        <p className="mt-2 text-xs opacity-90">
          A aplicação está bloqueada até correção das violações críticas.
        </p>
        <p className="mt-1 text-xs opacity-75">
          Coverage: {result.coverage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

