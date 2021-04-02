<template>
  <div class="com-container">
    <div ref="stock" class="com-chart"></div>
  </div>
</template>

<script>
export default {
  name: 'Stock',
  data () {
    return {
      chartInstance: null,
      data: null,
      currentIndex: 0,
      timer: null
    }
  },
  created () {
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 第一次主动处理
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
    this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    // 初始化
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock, 'chalk')
      const initOption = {
        title: {
          text: this.$store.state.config.title.stockTitle,
          left: 20,
          top: 20
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
      this.data = res
      this.updateData()
      this.startInterval()
    },
    // 更新数据
    updateData () {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.data.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          radius: [110, 100],
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          // 关闭防止标签重叠策略
          avoidLabelOverlap: false,
          labelLine: {
            show: false // 隐藏指示线
          },
          data: [
            {
              name: item.name + '\n' + item.sales,
              value: item.sales,
              label: {
                position: 'center',
                color: colorArr[index][0],
                show: true
              },
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    handlerResize () {
      const titleFontSize = this.$refs.stock.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2.8
      const outerRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 切换
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateData()
      this.showChoice = false
    },
    startInterval () {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateData() // 在更改完currentIndex之后 , 需要更新界面
      }, 2000)
    }
  }
}
</script>

<style lang='less' scoped></style>
