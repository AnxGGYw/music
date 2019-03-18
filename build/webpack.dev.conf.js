'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const bodyParser = require('body-parser')

const axios = require('axios')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    before(app) {
      app.use(bodyParser.urlencoded({ extended: true })) // the object returned is any type

      app.get('/api/getDiscList', async (req, res) => {
        const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
        const response = await axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).catch(e => {
          console.log(e)
        })
        res.json(response.data)
      })

      app.post('/api/getSongPurl', bodyParser.json(), async (req, res) => { // bodyParser.json() 将请求参数挂载到res.body上
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        const response = await axios.post(url, req.body, {
          headers: {
            referer: 'https://y.qq.com/',
            origin: 'https://y.qq.com',
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).catch((e) => {
          console.log(e)
        })
        res.json(response.data)
      })

      app.get('/api/getLyric', async (req, res) => {
        const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
        const response = await axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).catch((e) => {
          console.log(e)
        })
        var retData = response.data
        if (typeof retData === 'string') {
          var regex = /^\w+\(({[^()]+})\)$/
          var matches = retData.match(regex)
          if (matches) {
            retData = JSON.parse(matches[1])
          }
        }
        res.json(retData)
      })

      app.get('/api/getCdInfo', async (req, res) => {
        const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
        const response = await axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).catch((e) => {
          console.log(e)
        })
        let retData = response.data
        if (typeof retData === 'string') {
          const regex = /^\w+\(({.+})\)$/
          const matches = retData.match(regex)
          if (matches) {
            retData = JSON.parse(matches[1])
          }
        }
        res.json(retData)
      })

      app.get('/api/search', async (req, res) => {
        const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
        const response = await axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).catch((e) => {
          console.log(e)
        })
        res.json(response.data)
      })
    },
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
