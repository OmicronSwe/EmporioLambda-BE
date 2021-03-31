// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: { ecmaVersion: 8 }, // to enable features such as async/await
  ignorePatterns: ["node_modules/*", "!.prettierrc.js"], // We don't want to lint generated files nor node_modules, but we want to lint .prettierrc.js (ignored by default by eslint)
  extends: [
    "airbnb-typescript",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "prettier/prettier": ["error", {}, { usePrettierrc: true }], // Includes .prettierrc.js rules
    "no-plusplus": "off",
    eqeqeq: "off",
    "@typescript-eslint/no-shadow": "off",
    "prefer-destructuring": "off",
    "import/prefer-default-export": "off",
    "no-await-in-loop": "off",
    "no-console": "off",
  },
  overrides: [
    {
      files: ["test/*"],
      rules: {
        "@typescript-eslint/no-unused-expressions": "off",
      },
    },
  ],
};
