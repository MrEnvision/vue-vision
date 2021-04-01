<template>
  <div class="seller-wrap com-container">
    <div ref="seller" class="seller-chart com-chart"></div>
  </div>
</template>

<script>
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
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 在页面加载完成的时候, 主动进行屏幕的适配
  },
  destroyed () {
    clearInterval(this.timer)
    window.removeEventListener('resize', this.handlerResize)
  },
  methods: {
    // 初始化Echarts实例对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller, 'chalk')
      // 初始化配置
      const initOption = {
        title: {
          text: this.$store.state.config.title.sellerTitle,
          left: 20,
          top: 20
        },
        grid: {
          top: '15%',
          left: '3%',
          right: '6%',
          bottom: '5%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
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
    async getData () {
      // 前面axios已经挂载在main.js上,即全局,可直接使用this.$http
      const res = await this.$http.get('seller')
      if (res && res.status === 200) {
        const data = res.data
        data.sort((a, b) => {
          return a.value - b.value
        })
        this.data = data
        this.totalPage = Math.ceil(data.length / 5)
        this.updateData()
        this.startInterval()
      }
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
    // 动态刷新
    startInterval () {
      this.timer = setInterval(() => {
        this.currentPage = this.currentPage + 1 <= this.totalPage ? this.currentPage + 1 : 1
        this.updateData()
      }, 2000)
    },
    // 分辨率适配
    handlerResize () {
      const width = this.$refs.seller.offsetWidth
      const titleFontSize = width / 100 * 3.6
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
