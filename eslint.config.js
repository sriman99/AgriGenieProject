import nextPlugin from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-key': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/no-children-prop': 'off',
      'react/no-unknown-property': 'off'
    },
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/public/**',
      '**/*.config.js',
      '**/*.setup.js',
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.stories.tsx',
      '**/*.d.ts',
      '**/src/app/api/**/*',
      '**/src/lib/**/*',
      '**/src/components/**/*'
    ]
  }
]; 