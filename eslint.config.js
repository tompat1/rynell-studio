import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['execution/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [
      'src/contexts/**/*.{js,jsx}',
      'src/components/{Journal,QwenStudio,Services,Shop,StudioLab,StudioModelSelector}.jsx',
    ],
    rules: {
      // These modules intentionally share provider hooks or catalog data with components.
      'react-refresh/only-export-components': 'off',
    },
  },
])
