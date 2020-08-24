module.exports = {
  plugins: [
    // https://github.com/postcss/postcss-cli#context
    // https://github.com/jonathantneal/postcss-font-magician#hosted
    // https://github.com/jonathantneal/postcss-font-magician#async
    require('postcss-import'),
    require('postcss-url')({url: 'rebase'}),
    require('postcss-preset-env')({
      stage: 2,
      browser: '>3%'
    }),
    require('cssnano'),
  ]
}
