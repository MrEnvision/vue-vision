<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header">
      <div class="bg">
        <img :src="headerSrc" alt="">
      </div>
      <span class="logo">
        @MrEnvision
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="change" @click="handleChangeTheme" alt="">
        <span class="datetime">{{ time | formatTime }}</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="[fullScreenStatus.trend ? 'fullscreen' : '']">
          <!-- 销量趋势图表 -->
          <Trend ref="trend"></Trend>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('trend')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="[fullScreenStatus.seller ? 'fullscreen' : '']">
          <!-- 商家销售金额图表 -->
          <Seller ref="seller"></Seller>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('seller')" :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="[fullScreenStatus.map ? 'fullscreen' : '']">
          <!-- 商家分布图表 -->
<!--          <Map ref="map"></Map>-->
          <Map2 ref="map2"></Map2>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('map2')" :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom" :class="[fullScreenStatus.rank ? 'fullscreen' : '']">
          <!-- 地区销量排行图表 -->
          <Rank ref="rank"></Rank>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('rank')" :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
          <!-- 热销商品占比图表 -->
          <Hot ref="hot"></Hot>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('hot')" :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="right-bottom" :class="[fullScreenStatus.stock ? 'fullscreen' : '']">
          <!-- 库存销量分析图表 -->
          <Stock ref="stock"></Stock>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span @click="changeSize('stock')" :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Hot from '../components/Hot'
// import Map from '../components/Map'
import Map2 from '../components/Map2'
import Rank from '../components/Rank'
import Seller from '../components/Seller'
import Stock from '../components/Stock'
import Trend from '../components/Trend'

import { getThemeValue } from '../utils/theme_util'
import { mapState } from 'vuex'

// 创建一个函数来增加月日时小于10在前面加0
const completeDate = function (value) {
  return value < 10 ? '0' + value : value
}

export default {
  name: 'ScreenPage',
  components: {
    Hot,
    // Map,
    Map2,
    Rank,
    Seller,
    Stock,
    Trend
  },
  data () {
    return {
      time: new Date().getTime(),
      // 定义每一个图表的全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      },
      timer: null
    }
  },
  computed: {
    ...mapState(['theme']),
    headerSrc () {
      return require('./../assets/img/' + getThemeValue(this.theme).headerBorderSrc)
    },
    themeSrc () {
      return require('./../assets/img/' + getThemeValue(this.theme).themeSrc)
    },
    containerStyle () {
      return {
        color: getThemeValue(this.theme).titleColor,
        backgroundColor: getThemeValue(this.theme).backgroundColor
      }
    }
  },
  filters: {
    formatTime: (value) => {
      // 创建一个时间日期对象
      const date = new Date(value)
      // 返回格式化后的日期
      return `${date.getFullYear()}-${completeDate(date.getMonth() + 1)}-${completeDate(date.getDate())}  ${completeDate(date.getHours())}:${completeDate(date.getMinutes())}`
    }
  },
  created () {
    this.$socket.registerCallBack('themeChange', this.recvThemeChange)
  },
  mounted () {
    const that = this
    this.timer = setInterval(() => {
      that.time = new Date().getTime()
    }, 30000)
  },
  destroyed () {
    this.$socket.unRegisterCallBack('themeChange')
    clearInterval(this.timer)
  },
  methods: {
    // 发送切换主题信息
    handleChangeTheme () {
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    // 处理切换主题
    recvThemeChange () {
      this.$store.commit('CHANGE_THEME')
    },
    // 单个组件缩放处理
    changeSize (type) {
      // 1.改变fullScreenStatus的数据
      // 2.需要手动调用每一个图表组件的handlerResize的方法
      this.fullScreenStatus[type] = !this.fullScreenStatus[type]
      this.$nextTick(() => {
        this.$refs[type].handlerResize()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;

  .bg {
    img {
      width: 100%;
    }
  }

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }

  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-80%);
  }

  .logo {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-80%);
  }

  .change {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }

  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
}

.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;

  .screen-left {
    height: 100%;
    width: 27.6%;

    #left-top {
      height: 53%;
      position: relative;
    }

    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }

  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;

    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }

    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }

  .screen-right {
    height: 100%;
    width: 27.6%;

    #right-top {
      height: 46%;
      position: relative;
    }

    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}

.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}

// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}
</style>
