module.exports = {
  extends: ['airbnb-typescript-prettier'],
  rules: {
      'prettier/prettier': [
          'error',
          {
              endOfLine: 'auto',
          },
      ],
      'react/jsx-props-no-spreading': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'import/prefer-default-export': 'off',
      'react/no-array-index-key': 'off',
      'import/no-cycle': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/require-default-props': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-underscore-dangle': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
  },
};
