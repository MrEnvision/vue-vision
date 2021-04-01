import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '../views/SellerPage'
import HotPage from '../views/HotPage'
import MapPage from '../views/MapPage'
import RankPage from '../views/RankPage'
import StockPage from '../views/StockPage'
import TrendPage from '../views/TrendPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/seller',
    component: SellerPage
  },
  {
    path: '/hot',
    component: HotPage
  },
  {
    path: '/map',
    component: MapPage
  },
  {
    path: '/rank',
    component: RankPage
  },
  {
    path: '/stock',
    component: StockPage
  },
  {
    path: '/trend',
    component: TrendPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
