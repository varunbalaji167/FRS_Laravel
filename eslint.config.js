import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                route: 'readonly',
                localStorage: 'readonly',
                navigator: 'readonly',
                FormData: 'readonly',
                URL: 'readonly',
                File: 'readonly',
                Event: 'readonly',
                IntersectionObserver: 'readonly',
                atob: 'readonly',
                btoa: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...react.configs.recommended.rules,
            // Only the two long-standing hooks rules (rules-of-hooks,
            // exhaustive-deps) — v7's react-compiler-oriented rules
            // (purity/refs/set-state-in-effect) flag patterns all over the
            // existing wizard/autosave code that are out of scope for this
            // phase's "bootstrap the linter" goal. See PLAN.md Phase 8.
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['resources/js/test/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                global: 'readonly',
            },
        },
    },
    prettier,
    {
        ignores: ['vendor/**', 'node_modules/**', 'public/build/**', 'storage/**', 'bootstrap/cache/**'],
    },
];
