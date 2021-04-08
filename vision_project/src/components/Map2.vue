<template>
  <div class="com-container">
    <div ref="map2" class="com-chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getConfig } from '../utils/config_utils'
import geoCoordMap from '../utils/map_config'

export default {
  name: 'Map2',
  data () {
    return {
      chartInstance: null,
      data: null
    }
  },
  created () {
    this.$socket.registerCallBack('mapData2', this.getData)
  },
  computed: {
    ...mapState(['theme'])
  },
  mounted () {
    this.initChart(this.theme)
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData2',
      chartName: 'map2',
      value: ''
    })
    window.addEventListener('resize', this.handlerResize)
    this.handlerResize()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handlerResize)
    this.$socket.unRegisterCallBack('mapData2')
  },
  methods: {
    async initChart (theme) {
      this.chartInstance = this.$echarts.init(this.$refs.map2, theme)
      const res = await this.$http.get('map/china')
      this.$echarts.registerMap('china', res.data)
      const initOption = {
        title: {
          text: '▎飞行路线',
          left: getConfig('title').left,
          top: getConfig('title').top
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          label: {
            emphasis: {
              show: true,
              color: '#fff'
            }
          },
          roam: false,
          zoom: 1,
          itemStyle: {
            areaColor: '#2E72Bf',
            borderColor: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if (params.seriesType === 'effectScatter') {
              return '线路：' + params.data.name + '' + params.data.value[2]
            } else if (params.seriesType === 'lines') {
              return (
                params.data.fromName +
                '>' +
                params.data.toName +
                '<br />' +
                params.data.value
              )
            } else {
              return params.name
            }
          }
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // 获取数据
    getData (res) {
      this.data = res
      this.updateData()
    },
    updateData () {
      const series = []
      const type = [
        ['西安', this.data.XAData],
        ['西宁', this.data.XNData],
        ['银川', this.data.YCData]
      ]
      const color = ['#fff', '#fff', '#fff'] // 航线的颜色
      const convertData = (data) => {
        const res = []
        for (let i = 0; i < data.length; i++) {
          const dataItem = data[i]
          const fromCoord = geoCoordMap[dataItem[0].name]
          const toCoord = geoCoordMap[dataItem[1].name]
          if (fromCoord && toCoord) {
            res.push({
              fromName: dataItem[0].name,
              toName: dataItem[1].name,
              coords: [fromCoord, toCoord],
              value: dataItem[1].value
            })
          }
        }
        return res
      }
      const planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'

      type.forEach((item, index) => {
        series.push(
          {
            name: item[0] + ' Top3',
            type: 'lines',
            zlevel: 1,
            effect: {
              show: true,
              period: 6,
              trailLength: 0.7,
              color: 'red',
              symbolSize: 3
            },
            lineStyle: {
              normal: {
                color: color[index],
                width: 0,
                curveness: 0.2
              }
            },
            data: convertData(item[1])
          },
          {
            name: item[0] + ' Top3',
            type: 'lines',
            zlevel: 2,
            symbol: ['none', 'arrow'],
            symbolSize: 10,
            effect: {
              show: true,
              period: 6,
              trailLength: 0,
              symbol: planePath,
              symbolSize: 15
            },
            lineStyle: {
              normal: {
                color: color[index],
                width: 1,
                opacity: 0.6,
                curveness: 0.2
              }
            },
            data: convertData(item[1])
          },
          {
            name: item[0] + ' Top3',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: '{b}'
              }
            },
            symbolSize: function (val) {
              return val[2] / 8
            },
            itemStyle: {
              normal: {
                color: color[index]
              },
              emphasis: {
                areaColor: '#2B91B7'
              }
            },
            data: item[1].map(function (dataItem) {
              return {
                name: dataItem[1].name,
                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
              }
            })
          }
        )
      })
      const dataOption = {
        series
      }
      this.chartInstance.setOption(dataOption)
    },
    handlerResize () {
      const titleFontSize = this.$refs.map2.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }

  }
}
</script>

<style lang="scss" scoped></style>
