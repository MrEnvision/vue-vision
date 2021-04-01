// 处理业务逻辑的中间件,读取某个json文件的数据
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
