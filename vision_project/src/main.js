import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as echarts from 'echarts'
import axios from 'axios'

import './assets/theme/chalk'

// 将全局echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = echarts

// 请求基准路径配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
// 将axios挂载到Vue的原型对象上
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
