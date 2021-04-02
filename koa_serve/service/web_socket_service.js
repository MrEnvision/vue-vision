const path = require('path')
const fileUtils = require('../utils/file_utils')

// 创建websocket对象
const WebSocket = require('ws')
const wss = new WebSocket.Server({
  port: 9999
})


// 服务端开启监听
module.exports.listen = () => {
  // 对客户端连接进行监听
  wss.on('connection', client => {
    console.log('有客户端连接成功了!')
    // 对客户端发送信息进行监听
    client.on('message', async msg => {
      const payload = JSON.parse(msg)
      const action = payload.action
      if (action === 'getData') {
        // let filePath = '../data/' + payload.chartName + '.json'
        // payload.chartName // trend seller map rank hot stock
        const filePath = path.join(__dirname, '../data/' + payload.chartName + '.json')
        // 获取图表数据
        // const filePath = path.join(_dirname, '../data/' + payload.chartName + '.json')
        payload.data = await fileUtils.getFileJsonData(filePath)
        // 发送数据给客户端
        client.send(JSON.stringify(payload))
      } else {
        // fullScreen和themeChange事件需要转发到每一个连接的客户端
        // wss.clients 指所有客户端的连接
        wss.clients.forEach(client => {
          client.send(msg)
        })
      }
    })
  })
}


