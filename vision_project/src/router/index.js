import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '../views/sellerPage/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/seller',
    component: SellerPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
