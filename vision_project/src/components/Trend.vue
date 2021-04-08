<template>
  <div class="com-container">
    <div class="title" :style="[fontStyle, colorStyle]">
      <span style="margin-bottom: 5px;display: inline-block">{{ '▎' + showTitle + ' ' }}</span>
      <span class="iconfont title-icon" :style="[fontStyle]" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div v-show="showChoice" :style="[bgStyle]">
        <div class="select-item" :style="[paddingStyle]" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div ref="trend" class="com-chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getConfig } from '../utils/config_utils'
import { getThemeValue } from '../utils/theme_util'

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
  computed: {
    ...mapState(['theme']),
    selectTypes () {
      if (!this.data) {
        return []
      } else {
        return this.data.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    fontStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    colorStyle () {
      return {
        color: getThemeValue(this.theme).titleColor
      }
    },
    bgStyle () {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor2
      }
    },
    showTitle () {
      if (!this.data) {
        return ''
      } else {
        return this.data[this.choiceType].title
      }
    },
    paddingStyle () {
      return {
        paddingLeft: this.titleFontSize + 'px'
      }
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
    // 注册回调函数
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted () {
    this.initChart(this.theme)
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
    initChart (theme) {
      this.chartInstance = this.$echarts.init(this.$refs.trend, theme)
      const initOption = {
        xAxis: {
          type: 'category',
          boundaryGap: false // 是否需要间隔，即线是否从y轴开始，而不具有间隙
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '5%',
          right: '6%',
          top: '25%',
          bottom: '5%',
          containLabel: true
        },
        legend: {
          top: getConfig('legend').top,
          icon: getConfig('legend').icon
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    getData (res) {
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
                color: getConfig('colorArr1')[index]
              },
              {
                offset: 1,
                color: getConfig('colorArr2')[index]
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
      this.titleFontSize = this.$refs.trend.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 1.2
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

<style lang="scss" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  font-weight: 500;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-item {
    cursor: pointer;
    padding-top: 5px;
    padding-right: 0;
    padding-bottom: 5px;
    font-weight: 500;
  }
}
</style>
