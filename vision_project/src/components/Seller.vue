<template>
  <div class="com-container">
    <div ref="seller" class="com-chart"></div>
  </div>
</template>

<script>
import { getConfig } from '../utils/config_utils'
import { mapState } from 'vuex'

export default {
  name: 'Seller',
  data () {
    return {
      chartInstance: null,
      data: null,
      currentPage: 1,
      totalPage: 0,
      timer: null
    }
  },
  computed: {
    ...mapState(['theme'])
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
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  mounted () {
    this.initChart(this.theme)
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 在页面加载完成的时候, 主动进行屏幕的适配
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
    clearInterval(this.timer)
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 初始化
    initChart (theme) {
      this.chartInstance = this.$echarts.init(this.$refs.seller, theme)
      // 初始化配置
      const initOption = {
        title: {
          text: '▎商家销售量统计',
          left: getConfig('title').left,
          top: getConfig('title').top
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        grid: {
          top: '30%',
          left: '3%',
          right: '5%',
          bottom: '5%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              type: 'solid',
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                }, {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timer)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取数据
    getData (res) {
      res.sort((a, b) => {
        return a.value - b.value
      })
      this.data = res
      this.totalPage = Math.ceil(res.length / 5)
      this.updateData()
      this.startInterval()
    },
    // 更新数据
    updateData () {
      const showData = this.data.slice((this.currentPage - 1) * 5, this.currentPage * 5)
      const dataOption = {
        yAxis: {
          data: showData.map(item => item.name)
        },
        series: [
          {
            data: showData.map(item => item.value)
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    handlerResize () {
      const titleFontSize = this.$refs.seller.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 循环显示
    startInterval () {
      this.timer = setInterval(() => {
        this.currentPage = this.currentPage + 1 <= this.totalPage ? this.currentPage + 1 : 1
        this.updateData()
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped></style>
