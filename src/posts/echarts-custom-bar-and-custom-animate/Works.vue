<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ECharts } from 'echarts'

const props = defineProps<{
  all?: boolean
  unusualBar?: boolean
  customAnimate?: boolean
}>()

defineOptions({
  name: 'EChartsCustomBarAndCustomAnimateWorks',
})

const containerRef = ref<HTMLElement>()
let echarts: typeof import('echarts/core') | null = null
let chart: ECharts | null = null

async function ensureLoadedECharts() {
  if (echarts)
    return echarts
  const [_echarts, { BarChart, CustomChart }, { GridComponent, LegendComponent }, { CanvasRenderer }] = await Promise.all([
    import('echarts/core'),
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/renderers'),
  ])
  echarts = _echarts
  echarts.use([BarChart, CustomChart, GridComponent, LegendComponent, CanvasRenderer])
  return echarts
}

async function renderChart() {
  const echarts = await ensureLoadedECharts()
  chart = echarts.init(containerRef.value!) as unknown as ECharts

  const runningData = [120, 200, 150, 80, 70, 110, 130]
  const unusualData = [60, 100, 70, 40, 35, 50, 60]

  chart.setOption({
    legend: {
      show: true,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
      max: 400,
    },
    series: [
      {
        type: 'bar',
        name: 'Running',
        data: runningData,
      },
      ...((props.all || props.unusualBar)
        ? [
            {
              type: 'custom',
              name: 'Unusual',
              data: unusualData,
              itemStyle: { color: '#91CC75' },
              renderItem: (params: any, api: any) => {
                const { dataIndex } = params
                let [x, y] = api.coord([api.value(0), api.value(1)])
                const [, height] = api.size([api.value(0), api.value(1)])
                const [{ width }] = api.barLayout({ count: 1 })
                const [, runningBarHeight] = api.size([api.value(0), runningData[dataIndex]])
                x -= width / 2

                return {
                  type: 'rect',
                  x,
                  y: y - runningBarHeight,
                  shape: {
                    width,
                    height,
                  },
                  style: { fill: '#91CC75' },
                  enterFrom: {
                    scaleY: 0,
                    y: y + height,
                  },
                }
              },
            },
          ]
        : []),
    ],
  })

  if (props.all || props.customAnimate) {
    chart.getZr().storage.getDisplayList()
      .forEach((el) => {
        if (!el.animators.length) {
          el.animateFrom(
            { style: { opacity: 0 } },
            {
              duration: 666,
            },
          )
        }
      })
  }
}

function rerenderChart() {
  chart?.dispose()
  renderChart()
}

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  chart?.dispose()
})
</script>

<template>
  <div style="width: 100%; height: 500px;">
    <div ref="containerRef" style="width: 100%; height: 100%;" />
  </div>
  <p>
    <button class="btn-rerender" @click="rerenderChart">
      Rerender
    </button>（点击按钮来重新渲染图表）
  </p>
</template>

<style lang="scss" scoped>
.btn-rerender {
  font-size: 14px;
  padding: 2px 5px;
  cursor: pointer;
}
</style>
