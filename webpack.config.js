var Encore = require('@symfony/webpack-encore')
const CopyWebpackPlugin = require('copy-webpack-plugin')
var path = require('path')

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev')
}

// TODO: verify if we should be copying tinymce like this?
Encore.setOutputPath('public/build')
  .setPublicPath(process.env.WEBPACK_PUBLIC_PATH || '/build')
  .setManifestKeyPrefix('build')
  .addEntry('app', './assets/js/index.js')
  .addEntry('admin', './assets/js/admin.js')

  .addPlugin(new CopyWebpackPlugin({
    patterns: [
      { from: './assets/mediaAssets', to: 'static'},
      {
        context: './node_modules/tinymce/',
        from: '**/*.min.{js,css,woff}',
        to: 'static/tinymce/[path][name].[ext]'
      }
    ]
  }))

  .disableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  .configureCssLoader((options) => {
    options.modules = {
      auto: (resourcePath) => resourcePath.endsWith('.module.css')
    }
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
