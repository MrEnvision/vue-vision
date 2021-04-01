import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  title: {
    sellerTitle: '▎商家销售量统计'
  }
}

export default new Vuex.Store({
  state
})
