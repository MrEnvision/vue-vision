<template>
  <div class="com-container">
    <div ref="hot" class="com-chart"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="[doubleFontStyle, colorStyle]">&#xe6eb;</span>
    <span class="iconfont arr-right" @click="toRight" :style="[doubleFontStyle, colorStyle]">&#xe6ee;</span>
    <span class="cat-name" :style="[fontStyle, colorStyle]">{{ catName }}</span>
  </div>
</template>

<script>
import { getThemeValue } from '../utils/theme_util'
import { getConfig } from '../utils/config_utils'
import { mapState } from 'vuex'

export default {
  name: 'Hot',
  data () {
    return {
      chartInstance: null,
      data: null,
      currentIndex: 0,
      titleFontSize: 0
    }
  },
  computed: {
    ...mapState(['theme']),
    fontStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    doubleFontStyle () {
      return {
        fontSize: this.titleFontSize * 2 + 'px'
      }
    },
    colorStyle () {
      return {
        color: getThemeValue(this.theme).titleColor
      }
    },
    catName () {
      return this.data ? this.data[this.currentIndex].name : ''
    }
  },
  watch: {
    theme: {
      handler (newVale) {
        // 先销毁图表
        this.chartInstance.dispose()
        // 重新初始化图表
        this.initChart(newVale)
        this.updateData()
        this.handlerResize()
      }
    }
  },
  created () {
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted () {
    this.initChart(this.theme)
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
      value: ''
    })
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 第一次主动处理
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    // 初始化
    initChart (theme) {
      this.chartInstance = this.$echarts.init(this.$refs.hot, theme)
      const initOption = {
        title: {
          text: '▎热销商品占比',
          left: getConfig('title').left,
          top: getConfig('title').top
        },
        legend: {
          top: getConfig('legend').top,
          icon: getConfig('legend').icon
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            // 计算出所有三级分类的数值总和
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach(item => {
              retStr += `
              ${item.name}:${parseInt(item.value / total * 100) + '%'}
              <br/>
              `
            })
            return retStr
          }
        },
        series: [
          {
            type: 'pie',
            // label: {
            //   show: false
            // },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    getData (res) {
      this.data = res
      this.updateData()
    },
    // 更新数据
    updateData () {
      const seriesData = this.data[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const legendData = this.data[this.currentIndex].children.map(item => item.name)
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [{
          data: seriesData
        }]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    handlerResize () {
      this.titleFontSize = this.$refs.hot.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ['50%', '60%'],
            label: {
              textStyle: {
                fontSize: this.titleFontSize / 1.5
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 左切换
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.data.length - 1
      }
      this.updateData()
    },
    // 右切换
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.data.length - 1) {
        this.currentIndex = 0
      }
      this.updateData()
    }
  }
}
</script>

<style lang="scss" scoped>
.iconfont {
  position: absolute;
  top: 50%;
  cursor: pointer;
}

.arr-left {
  left: 10%;
}

.arr-right {
  right: 10%;
}

.cat-name {
  position: absolute;
  right: 10%;
  bottom: 20px;
  color: white;
}
</style>
