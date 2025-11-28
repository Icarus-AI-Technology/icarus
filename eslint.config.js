import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.husky', 'vitest.config.ts', 'archive'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Desabilitado: muitos imports são para uso futuro ou interfaces externas
      '@typescript-eslint/no-unused-vars': 'off',
      // Desabilitado: any é necessário em algumas interfaces de terceiros
      '@typescript-eslint/no-explicit-any': 'off',
      // Desabilitado: hooks com dependências complexas
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Allow require() in config files
  {
    files: ['**/*.config.{js,ts,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Allow require() in React Native/Expo mobile files
  {
    files: ['mobile/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  // Test utilities can export non-components
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
