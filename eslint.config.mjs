export default [
  {
    files: ["js/main.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        CSS: "readonly",
        IntersectionObserver: "readonly",
        getComputedStyle: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "args": "none" }],
      "no-undef": "error",
      "eqeqeq": ["error", "smart"]
    }
  },
  {
    files: ["tests/**/*.js", "tests/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        test: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "args": "none" }],
      "no-undef": "error"
    }
  }
];
