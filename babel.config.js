module.exports = {
  'presets': [
    [
      '@vue/app',
      {
        'useBuiltIns': 'entry'
      },
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
      }
    ]
  ]
}
