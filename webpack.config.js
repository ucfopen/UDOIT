var Encore = require('@symfony/webpack-encore');
var path = require('path');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    
    .addEntry('app', './assets/js/app.js')
    
    .disableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    
    .enableSassLoader()
    .configureCssLoader(options => { options.modules = true })
    // .enablePostCssLoader()
    .autoProvidejQuery()

    .enableReactPreset()
;

module.exports = Encore.getWebpackConfig();
