import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  theme: 'chalk'
}
const mutations = {
  CHANGE_THEME (state) {
    state.theme = state.theme === 'chalk' ? 'vintage' : 'chalk'
  }
}

export default new Vuex.Store({
  state,
  mutations
})
