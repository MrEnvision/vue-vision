<template>
  <div class="com-container">
    <div ref="rank" class="com-chart"></div>
  </div>
</template>

<script>
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
  created () {
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted () {
    this.initChart()
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
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank, 'chalk')
      const initOption = {
        title: {
          text: this.$store.state.config.title.rankTitle,
          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
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
    getData (res) {
      res.sort((a, b) => {
        return b.value - a.value
      })
      this.data = res
      this.updateChart()
      this.startInterval()
    },
    updateChart () {
      const provinceArr = this.data.map(item => item.name)
      const valueArr = this.data.map(item => item.value)
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
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

<style lang='less' scoped></style>
