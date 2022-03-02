var Encore = require('@symfony/webpack-encore')
const CopyWebpackPlugin = require('copy-webpack-plugin')
var path = require('path')

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev')
}

Encore.setOutputPath('public/build')
  .setPublicPath('/build')

  .addEntry('app', './assets/js/index.js')
  .addEntry('admin', './assets/js/admin.js')

  .addPlugin(new CopyWebpackPlugin({
    patterns: [
      { from: './assets/mediaAssets', to: 'static'}
    ]
  }))

  .disableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  .configureCssLoader((options) => {
    options.modules = true
  })
  // .enablePostCssLoader()
  .autoProvidejQuery()

  .enableReactPreset()

  .configureBabel(null, function (babelConfig) {
    //This is needed.

    babelConfig.plugins = [
      'transform-object-rest-spread',
      'transform-class-properties',
    ]
  })

module.exports = Encore.getWebpackConfig()
