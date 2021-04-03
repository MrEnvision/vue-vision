<template>
  <div class="com-container">
    <div ref="rank" class="com-chart"></div>
  </div>
</template>

<script>
import { getConfig } from '../utils/config_utils'
import { mapState } from 'vuex'

export default {
  name: 'Rank',
  data () {
    return {
      chartInstance: null,
      data: null,
      timer: null,
      startValue: 0, // 区域缩放的起点值
      endValue: 9 // 区域缩放的终点值
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
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted () {
    this.initChart(this.theme)
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
    clearInterval(this.timer)
    this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    // 初始化
    initChart (theme) {
      this.chartInstance = this.$echarts.init(this.$refs.rank, theme)
      const initOption = {
        title: {
          text: '▎地区销售排行',
          left: getConfig('title').left,
          top: getConfig('title').top
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          { type: 'bar' }
        ],
        tooltip: {
          show: true
        },
        grid: {
          top: '35%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        }
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
        return b.value - a.value
      })
      this.data = res
      this.updateData()
      this.startInterval()
    },
    // 更新数据
    updateData () {
      const provinceArr = this.data.map(item => item.name)
      const valueArr = this.data.map(item => item.value)
      const colorArr = getConfig('colorArr3')
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: (arg) => {
                let targetColorArr
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    handlerResize () {
      const titleFontSize = this.$refs.rank.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
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
        this.startValue++
        this.endValue++
        if (this.endValue > this.data.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.chartInstance.setOption({
          dataZoom: {
            startValue: this.startValue,
            endValue: this.endValue
          }
        })
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped></style>
