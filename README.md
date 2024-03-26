# font-compression-plugin
轻量级字体压缩webpack插件
> 1.0.2修复了1.0.1无法同时使用多个字体的BUG
## 安装
```npm
npm i -D font-compression-plugin
```
## 使用
在`webpack.config.js`文件中使用
```js
const FontCompressionPlugin = require('font-compression-plugin')
module.exports = {
  plugins: [
    new FontCompressionPlugin({
      path:'./src/assets/fonts/some-font.ttf' // 对应为项目中字体的相对路径
    })
  ]
}
```
## 配置
- path `字符串` 字体路径 (相对路径)
- include `字符串` 额外包含的文字
- exclude `字符串` 排除的文字
- fontSet `字符串` 字符集(填写后不遍历资源文件的文字)
- baseFont `字符串` 补充基础字符集(默认基础字符集为`0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.?/!。，;:：`)

> 默认提取资源文件中所有的中文字符进行字体压缩,如果只对部分文字压缩,则配置`fontSet`

> path如不填写,则控制台打印提取的文字

```js
const FontCompressionPlugin = require('font-compression-plugin')
module.exports = {
  plugins: [
    new FontCompressionPlugin({
      path:'./src/assets/fonts/some-font.ttf',
      fontSet: '你好世界'
    })
  ]
}
```

