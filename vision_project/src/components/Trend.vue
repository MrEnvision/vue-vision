<template>
  <div class="com-container">
    <div class="title" :style="comStyle1">
      <span>{{ '▎' + showTitle + ' ' }}</span>
      <span class="iconfont title-icon" :style="comStyle2" @click="showChoice = !showChoice"></span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div ref="trend" class="com-chart"></div>
  </div>
</template>

<script>
export default {
  name: 'Trend',
  data () {
    return {
      chartInstance: null,
      data: null,
      choiceType: 'map',
      showChoice: false,
      titleFontSize: 0
    }
  },
  created () {
    // 注册回调函数
    this.$socket.registerCallBack('trendData', this.getData)
  },
  computed: {
    selectTypes () {
      if (!this.data) {
        return []
      } else {
        return this.data.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle () {
      if (!this.data) {
        return ''
      } else {
        return this.data[this.choiceType].title
      }
    },
    // 设置给标题的样式
    comStyle1 () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    comStyle2 () {
      return {
        width: this.titleFontSize * 0.75 + 'px',
        height: this.titleFontSize * 0.75 + 'px',
        marginBottom: this.titleFontSize / 10 + 'px'
      }
    },
    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    // this.getData()
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize() // 第一次主动处理
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
    this.$socket.unRegisterCallBack('trendData')
  },
  methods: {
    // 初始化
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend, 'chalk')
      const initOption = {
        xAxis: {
          type: 'category',
          boundaryGap: false // 是否需要间隔，即线是否从y轴开始，而不具有间隙
        },
        yAxis: {
          type: 'value'
        },
        grid: {
          left: '3%',
          right: '4%',
          top: '25%',
          bottom: '5%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '13%',
          icon: 'circle'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    getData (res) {
      console.log(res)
      // const res = await this.$http.get('trend')
      // if (res && res.status === 200) {
      //   this.data = res.data
      //   this.updateData()
      // }
      this.data = res
      this.updateData()
    },
    // 更新数据
    updateData () {
      const timeArr = this.data.common.month
      const valueArr = this.data[this.choiceType].data.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: 'map',
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.$store.state.config.colorArr1[index]
              },
              {
                offset: 1,
                color: this.$store.state.config.colorArr2[index]
              }
            ])
          }
        }
      })
      const legendArr = this.data[this.choiceType].data.map(item => item.name)
      const dataOption = {
        legend: {
          data: legendArr
        },
        xAxis: {
          data: timeArr
        },
        series: valueArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 分辨率适配
    handlerResize () {
      this.titleFontSize = this.$refs.trend.offsetWidth / 100 * 3
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 切换
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateData()
      this.showChoice = false
    }
  }
}
</script>

<style lang='scss' scoped>
.title {
  position: absolute;
  left: 20px;
  top: 10px;
  z-index: 10;
  color: white;

  .iconfont {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-bottom: 2px solid white;
    border-left: 2px solid white;
    transform: rotate(-45deg);
  }

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-item {
    cursor: pointer;
    padding: 5px 0 5px 0;
  }

  .select-con {
    background-color: #222733;
  }
}
</style>
