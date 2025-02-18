const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',  // 修改为相对路径
  transpileDependencies: true,
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
})