/*
 * @Author       : zxlin
 * @Date         : 2023-11-23 14:39:15
 * @LastEditors  : zxlin
 * @LastEditTime : 2024-03-26 10:58:03
 * @FilePath     : \font-compression-plugin\src\index.js
 * @Description  : 
 */
const Fontmin = require('fontmin')
const { RawSource } = require('webpack-sources')

let baseFont = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.?/!。，;:：' // 基础字符集

function taskAssetsChar(compilation) {
  return [...new Set(Object.keys(compilation.assets).reduce((c, v) => {
    const value = compilation.assets[v]
    const source = value.source()
    if (typeof source === 'string') {
      return [...c, ...(source.match(/[\u4e00-\u9fa5]/g) || [])]
    } else {
      return c
    }

  }, []))].join('')
}

module.exports = class FontCompressionPlugin {
  constructor(option = {}) {
    /**
         * option 配置项
         * @param {String} option.path 字体路径
         * @param {String} option.include 额外包含的文字
         * @param {String} option.exclude 排除的文字
         * @param {String} option.fontSet 字符集(填写后不遍历资源文件的文字)
         * @param {String} option.baseFont 补充基础字符集
         */
    this.option = option
    if (option.baseFont && typeof option.baseFont === 'string') {
      baseFont += option.baseFont
    }
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync('font-compression-plugin', (compilation, callback) => {
      let character = ''

      if (this.option.fontSet && typeof this.option.fontSet === 'string') {
        character = this.option.fontSet
      } else {
        character = taskAssetsChar(compilation)
      }

      if (this.option.include && typeof this.option.include === 'string') {
        character += this.option.include
      }

      if (this.option.exclude && typeof this.option.exclude === 'string') {
        character = character.split('').filter(Boolean).filter(i => !this.option.exclude.includes(i)).join('')
      }

      character += baseFont

      character = [...new Set(character.split(''))].join('')

      if (this.option.path) {
        const assetsFile = Object.keys(compilation.assets).find(i => i.includes(this.option.path.slice(this.option.path.lastIndexOf('/') + 1, -4))) || ''
        if (!assetsFile) {
          console.log('\n项目未引用此字体:', this.option.path)
          return
        }
        const fontmin = new Fontmin()
          .src(this.option.path)
          .use(Fontmin.glyph({
            text: character,
            hinting: false
          }))
        fontmin.run(function (err, files) {
          if (err) {
            callback()
            throw err
          }
          const baseFileName = assetsFile.slice(assetsFile.lastIndexOf('/') + 1)
          const baseUrl = assetsFile.slice(0, assetsFile.lastIndexOf('/') + 1)
          const nextFileNameList = baseFileName.split('.')
          nextFileNameList.splice(nextFileNameList.length - 1, 0, new Date().getTime())
          const nextFileName = nextFileNameList.join('.')
          compilation.deleteAsset(assetsFile)
          compilation.emitAsset(baseUrl + nextFileName, new RawSource(Buffer.from(files[0].contents)))
          Object.keys(compilation.assets).forEach((v) => {
            const value = compilation.assets[v]
            const source = value.source()
            if (typeof source === 'string') {
              const r = new RegExp(baseFileName, 'g')
              if (r.test(source)) {
                const newSource = source.replace(r, nextFileName)
                compilation.updateAsset(v, new RawSource(newSource))
              }
            }
          })
          callback()
        })
      } else {
        console.log('\n项目中含有字体:')
        console.log(character)
        callback()
      }
    })
  }
}