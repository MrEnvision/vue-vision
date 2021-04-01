import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  title: {
    sellerTitle: '▎商家销售量统计',
    mapTitle: '▎商家分布',
    rankTitle: '▎地区销售排行'
  },
  // 半透明的颜色值
  colorArr1: [
    'rgba(11, 168, 44, 0.5)',
    'rgba(44, 110, 255, 0.5)',
    'rgba(22, 242, 217, 0.5)',
    'rgba(254, 33, 30, 0.5)',
    'rgba(250, 105, 0, 0.5)'
  ],
  // 全透明的颜色值
  colorArr2: [
    'rgba(11, 168, 44, 0)',
    'rgba(44, 110, 255, 0)',
    'rgba(22, 242, 217, 0)',
    'rgba(254, 33, 30, 0)',
    'rgba(250, 105, 0, 0)'
  ]
}

export default new Vuex.Store({
  state
})
