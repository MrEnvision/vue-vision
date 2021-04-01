<template>
  <div class="com-container" @dblclick="revertMap">
    <div ref="map" class="com-chart"></div>
  </div>
</template>

<script>
import { getProvinceMapInfo } from '../utils/map_utils'

export default {
  name: 'Map',
  data () {
    return {
      chartInstance: null,
      data: null,
      mapDate: {} // 所获取的地图省份数据，缓存之用，防止重复请求获取
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.handlerResize)
  },
  methods: {
    initChart: async function () {
      this.chartInstance = this.$echarts.init(this.$refs.map, 'chalk')
      const res = await this.$http.get('map/china')
      if (res && res.status === 200) {
        this.$echarts.registerMap('china', res.data)
        const initOption = {
          title: {
            text: this.$store.state.config.title.mapTitle,
            left: 20,
            top: 20
          },
          geo: {
            type: 'map',
            map: 'china',
            top: '5%',
            bottom: '5%',
            itemStyle: {
              areaColor: '#19548b',
              borderColor: '#333'
            }
          },
          legend: {
            left: '5%',
            bottom: '5%',
            orient: 'vertical'
          }
        }
        this.chartInstance.setOption(initOption)
        // 地图点击事件
        this.chartInstance.on('click', async (arg) => {
          const province = getProvinceMapInfo(arg.name)
          let provinceData
          if (this.mapDate[province.key]) {
            provinceData = this.mapDate[province.key]
          } else {
            const res = await this.$http.get(province.path)
            if (res && res.status === 200) {
              provinceData = res.data
              this.mapDate[province.key] = provinceData
            }
          }
          this.$echarts.registerMap(province.key, provinceData)
          const changeOption = {
            geo: { map: province.key }
          }
          this.chartInstance.setOption(changeOption)
        })
      }
    },
    async getData () {
      const res = await this.$http.get('map')
      if (res && res.status === 200) {
        this.data = res.data
        this.updateChart()
      }
    },
    updateChart () {
      const legendArr = this.data.map(item => item.name)
      const seriesArr = this.data.map(item => {
        return {
          type: 'effectScatter',
          rippleEffect: {
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    handlerResize () {
      const titleFontSize = this.$refs.map.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 回到中国地图
    revertMap () {
      const revertOption = {
        geo: { map: 'china' }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style lang='less' scoped></style>
