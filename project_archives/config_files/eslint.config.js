// ESLint v9+ config file
export default [
  // Global ignores (must be first)
  {
    ignores: [
      "legacy/**/*",
      "static/js/course_dashboard_backup.js",
      "venv/**/*",
      "venve/**/*",
      "__pycache__/**/*",
      "node_modules/**/*",
      ".venv/**/*",
      "**/werkzeug/debug/**/*.js"
    ]
  },
  // Main configuration
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        ace: "readonly",
        handleQuizSubmit: "readonly",
        localStorage: "readonly",
        SpeechSynthesisUtterance: "readonly",
        alert: "readonly",
        process: "readonly",
        MultipleChoice: "readonly",
        confirm: "readonly",
        module: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "no-undef": "error",
      "prefer-const": "warn",
      "no-var": "error"
    }
  }
];
