module.exports = {
  "extends": [
    "eslint:recommended",
    // "plugin:react/recommended"
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      // "jsx": true,
      "impliedStrict": true,
      // "modules": true
    }
  },
  "plugins": [
    // "react"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "commonjs": true
  }
};
