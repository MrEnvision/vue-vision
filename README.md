# 数据可视化项目-电商平台数据监控

> 本项目为电商平台数据可视化简易学习项目，教程详见[电商平台数据可视化实时监控系统学习项目](https://www.bilibili.com/video/BV1bh41197p8)。本项目分为[前端部分](./vision_project)和[后端部分](./koa_serve)，其中前端技术栈为Echarts+VUE，后端技术栈为Koa。



**注意 ⚠️ Echarts相关笔记详见 —— [Echart_Note](./note/echarts_note.md)**



# 项目启动

## 1. 后端项目

```shell
cd koa_serve
npm install
node app.js
```

## 2. 前端项目

```shell
cd vision_project
npm install
npm run serve
```



# 后端开发

## 1. KOA2介绍

> KOA2是基于 Node.js 平台的Web服务器框架，通过 `npm i koa` 安装。

特点：

- 支持async/await
- 采用洋葱模型的中间件

<img src="./note/img/洋葱中间件.png" style="zoom:30%;" />

洋葱模型中间件的调用顺序为第一层->第二层->第三层->第三层->第二层->第一层，非常类似于冒泡的行为，请求最先到达第一层中 间件，而最后也是第一层中间件对请求再次处理了一下

## 2. KOA2中间件

- Koa2 的实例对象通过 use 方法加入一个中间件
- 一个中间件就是一个函数,这个函数具备两个参数,分别是 ctx 和 next
- 内层中间件能否执行取决于外层中间件的 next 函数是否调用
- 调用 next 函数得到的是 Promise 对象, 如果想得到 Promise 所包装的数据, 可以结合 await 和 async

```js
app.use(async (ctx, next) => { 
  // 刚进入中间件想做的事情 
  await next()
  // 内层所有中间件结束之后想做的事情 
})
```

举例：

```js
app.use(async (ctx, next) => {
  console.log('第一层中间件-1')
  await next()
  console.log('第一层中间件-2')
})

app.use(async(ctx, next) => {
  console.log('第二层中间件-1')
  await next()
  console.log('第二层中间件-2')
})

app.use(async (ctx, next) => {
  console.log('第三层中间件-1')
  await next()
  console.log('第三层中间件-2')
})

// 结果：
// 第一层中间件-1
// 第二层中间件-1
// 第三层中间件-1
// 第三层中间件-2
// 第二层中间件-2
// 第一层中间件-2
// 第一层中间件-1
// 注意上述结果会出现两次，这是因为浏览器会自动请求一次图标啥的，此处无需关注。
```

## 3. KOA2快速上手

步骤：

- 安装 koa2 —— `npm i koa` 
- 编写app.js文件

```js
// // 1.创建koa对象
const Koa = require('koa') // 导入构造方法
const app = new Koa() // 通过构造方法, 创建实例对象

// 2.编写响应函数(中间件)
app.use((ctx, next) => {
  console.log(ctx.request.url)
  ctx.response.body = 'hello world'
})

// 3.绑定端口号 3000
app.listen(3000)
```

> ctx：上下文, 指的是请求所处于的Web容器,可以通过 ctx.request 拿到请求对象, 也可以通过 ctx.response 拿到响应对象
>
> next：内层中间件执行的入口

- 启动服务器 —— `node app.js`
- 在指定端口查看即可 —— `127.0.0.1:3000`

## 4. 后端项目开发

开发目标：三个中间件

- 计算服务器处理请求的总耗时
- 在响应头上加上响应内容的 mime 类型（浏览器更好的来处理由服务器返回的数据）
- 根据URL读取指定目录下的文件内容

<img src="./note/img/后台开发.png" style="zoom:50%;" />

**响应中间件开发**

```js
module.exports = async (ctx, next) => {
  // 记录开始的时间
  const start = Date.now()
  // 让内层中间件执行
  await next()
  // 记录结束的时间
  const end = Date.now()
  // 计算响应时间
  const duration = end - start
  // 设置响应头
  ctx.set("X-Response-Time", duration + "ms")
}
```

**响应头中间件**

```js
module.exports = async (ctx, next) => {
  ctx.set("Content-Type", "application/json; charset=utf-8")
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE")
  ctx.response.body = "{'success': true}"
  await next()
}
```

**业务逻辑中间件**

```js
const path = require("path")
const fileUtils = require("../utils/file_utils")

module.exports = async (ctx, next) => {
  // 获取请求路径
  const url = ctx.request.url;
  // 转化为文件路径
  const filePath = "../data" + url.replace("/api", "") + ".json"
  // 转化为绝对路径
  const finalPath = path.join(__dirname, filePath)
  // 获取数据并设置响应体
  try {
    ctx.response.body = await fileUtils.getFileJsonData(finalPath)
  } catch (error) {
    ctx.response.body = JSON.stringify({
      message: "读取文件失败！",
      status: 404
    })
  }
  await next()
}
```

**文件读取**

```js
// 读取文件的工具方法
const fs = require('fs')

module.exports.getFileJsonData = (filePath) => {
  // 根据文件的路径, 读取文件的内容
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (error, data) => {
      if(error) {
        // 读取文件失败
        reject(error)
      } else {
        // 读取文件成功
        resolve(data)
      }
    })
  })
}
```

**跨域设置**

```js
// 设置响应头
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*")
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST,
DELETE")
    await next();
})
```



# 前段开发

## 1. 全局挂载Echarts

- 安装echarts `npm i echarts -S`
- 在 `src/main.js` 文件中引入并将其挂载到 Vue 的原型对象上

```js
import * as echarts from 'echarts';

// 将全局echarts对象挂载到Vue的原型对象上 
Vue.prototype.$echarts = echarts
```

- 在别的组件中直接通过`this.$echarts`即可使用



