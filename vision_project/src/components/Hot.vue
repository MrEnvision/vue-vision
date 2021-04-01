<template>
  <div class="com-container">
    <div ref="hot" class="com-chart"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle2"></span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle2"></span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
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
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    comStyle2 () {
      return {
        fontSize: this.titleFontSize + 'px',
        width: this.titleFontSize + 'px',
        height: this.titleFontSize + 'px'
      }
    },
    catName () {
      if (!this.data) {
        return ''
      } else {
        return this.data[this.currentIndex].name
      }
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 第一次主动处理
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
  },
  methods: {
    // 初始化
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot, 'chalk')
      const initOption = {
        title: {
          text: this.$store.state.config.title.hotTitle,
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
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
            label: {
              show: false
            },
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
    async getData () {
      const res = await this.$http.get('hot')
      if (res && res.status === 200) {
        this.data = res.data
        this.updateData()
      }
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
      this.titleFontSize = this.$refs.hot.offsetWidth / 100 * 3
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
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 5.5,
            center: ['50%', '55%']
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
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.data.length - 1
      }
      this.updateData()
    },
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

<style lang='scss' scoped>
.iconfont {
  color: #FFF;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

.arr-left {
  left: 10%;
  transform: rotate(45deg);
}

.arr-right {
  right: 10%;
  transform: rotate(-135deg);
}

.cat-name {
  position: absolute;
  right: 10%;
  bottom: 20px;
  color: white;
}
</style>
