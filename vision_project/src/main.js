import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as echarts from 'echarts'
import axios from 'axios'

import './assets/theme/chalk'
import './assets/theme/vintage'

// 采用websocket获取数据
import SocketService from './utils/scoket_service'

SocketService.Instance.connect() // 连接服务器
Vue.prototype.$socket = SocketService.Instance // 将socket对象挂载到Vue的原型对象上

// 采用axios请求获取数据
axios.defaults.baseURL = 'http://127.0.0.1:8888/api' // 请求基准路径配置
Vue.prototype.$http = axios // 将axios挂载到Vue的原型对象上

// 将全局echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
