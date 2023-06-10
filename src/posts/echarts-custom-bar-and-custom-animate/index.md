---
container: Post
title: ECharts - 自定义柱状图实现 & 自定义图表中元素的动画
date: 2023/6/10
---

[[toc]]

> 在编写本篇文章时，ECharts 使用版本号是 ^5.4.2

## 前言

在 ECharts 中可以轻松的配置出一个柱状图表，不过所提供的基础配置难免在有时无法解决我们的需求，如下表，在每一列柱体之上还有一个不同类型的柱体（而并非是两个柱体重叠在一起），本篇文章通过介绍 ECharts 的自定义图形渲染相关配置和 API 来实现这样的效果

<EChartsCustomBarAndCustomAnimateWorks all />

## 自定义渲染图形

首先实现一个基本的柱状图图表，代码和预览效果如下：

```ts
const runningData = [120, 200, 150, 80, 70, 110, 130]

const options = {
  // 图例
  legend: {
    show: true,
  },
  // x 轴相关配置
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  // y 轴相关配置
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
  ],
}
```

<EChartsCustomBarAndCustomAnimateWorks />

接着实现 `Unusual` 柱体，`Unusual` 柱体描述的是完全不同的数据，所以需要单独配置一个 `options.series`，且指定 `type: 'custom'` 和提供 `renderItem` 方法来自定义图形的实现：

```ts
const runningData = [120, 200, 150, 80, 70, 110, 130]
const unusualData = [60, 100, 70, 40, 35, 50, 60]

const options = {
  // ... 省略其他配置
  series: [
    {
      type: 'bar',
      name: 'Running',
      data: runningData,
    },
    {
      // https://echarts.apache.org/zh/option.html#series-custom
      type: 'custom',
      name: 'Unusual',
      // 将要渲染的数据
      data: unusualData,
      renderItem: (params, api) => {
        // TODO
      }
    },
  ],
}
```

`renderItem` 方法会在遍历 `unusualData` 时候依次调用，它接收两个参数，`params` 和 `api`

+ `params` 是一个对象，有坐标系信息和当前的数据信息，如下：
  - `params.dataIndex` 是一个数字，表示当前数据的索引
  - `params.value` 是一个数字，表示当前数据的值
+ `api` 是一个对象，包含了一些 ECharts 提供的 API，该方法需要返回一个配置对象，该配置对象描述了应该怎么绘制这一列的图形
  - `api.value(...)` 得到给定维度的数据值，如 `api.value(0)` 和 `api.value(1)`  得到当前数据在 xAxis 和 yAxis 的值，但需要注意的是这里案例由于 xAxis 是类目轴，所以这里的值（`api.value(0)`）是类目的索引，而不是类目的值 `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`，而 yAxis 是数值轴，所以这里的值（`api.value(1)`）是 data 中的数值
  - `api.coord(...)` 将数据值映射到坐标系中的坐标点，`api.coord([api.value(0), api.value(1)])` 得到当前数据应该在坐标系中绘制的坐标（理解为折线图中的每个点），例如使用此方法可以得到 Unusual 柱体的左上角坐标
  - `api.size(...)` 得到数据值映射到坐标系上后的长度，`api.size([api.value(0), api.value(1)])` 得到当前数据在 xAxis 和 yAxis 上的应该有的长度，例如使用此方法可以得到 Unusual 柱体应该绘制的高度
  - `api.barLayout(...)` 得到在坐标系中已有的 `type = 'bar'` 的所有柱体的布局信息，例如使用此方法可以拿到每个 Running 柱体的宽度，以便按照这个宽度绘制出 Unusual 柱体

实现 `renderItem` 方法，代码如下：

> 在此坐标系中，容器的左上角坐标为 (0, 0)，向右和向下是正方向

```ts
const runningData = [120, 200, 150, 80, 70, 110, 130]
const unusualData = [60, 100, 70, 40, 35, 50, 60]

const options = {
  // ... 省略其他配置
  series: [
    {
      type: 'bar',
      name: 'Running',
      data: runningData,
    },
    {
      // https://echarts.apache.org/zh/option.html#series-custom
      type: 'custom',
      name: 'Unusual',
      data: unusualData,
      renderItem: (params, api) => {
        // 当前数据的索引 dataIndex
        const { dataIndex } = params
        // 当前数据在坐标系中的坐标
        let [x, y] = api.coord([api.value(0), api.value(1)])
        // 柱体的高度
        // 注意这里的第一个参数是在 x 轴上这一类目（两个刻度之间）的宽度，但柱体宽度不一定等于类目宽度，因此不使用这个宽度值
        const [, height] = api.size([api.value(0), api.value(1)])
        // 得到 Running 柱体的宽度，当做 Unusual 柱体的宽度
        // count: 1 表示在这个案例中每一个类目只有一个柱体
        const [{ width }] = api.barLayout({ count: 1 })
        // 同样使用 size 方法得到 Running 柱体的高度
        // 因为 Unusual 柱体在 Running 柱体之上，最终绘制 Unusual 柱体时需要考虑这个高度值
        const [, runningBarHeight] = api.size([api.value(0), runningData[dataIndex]])

        // 因为柱体有宽度，调整 x 坐标，使得柱体居中
        x -= width / 2

        return {
          // 定义个矩形
          type: 'rect',
          x,
          // y 坐标需要减去 Running 柱体的高度，使得 Unusual 柱体在 Running 柱体之上
          y: y - runningBarHeight,
          shape: {
            width,
            height,
          },
          style: { fill: '#91CC75' },
          // 定义入场动画
          enterFrom: {
            // scaleY: 0 -> 1
            scaleY: 0,
            // Unusual 柱体的定位随着 Running 柱体的高度而变化
            y: y + height,
          },
        }
      }
    },
  ],
}
```

<EChartsCustomBarAndCustomAnimateWorks unusual-bar />

## 自定义任意图表元素动画

在文章开头的案例中，xAxis 和 yAxis 的轴线、label 等也是有渐入的动画的，这是 ECharts 配置中没有提供的功能，实现这个功能需要简单了解下 ECharts 的底层渲染库 [ZRender](https://ecomfe.github.io/zrender-doc/public/)，在 ECharts 准备好所有需要绘制的图形后，会将这些图形交给 ZRender 进行渲染，因此可以通过 ZRender 拿到所有的图形，并通过 ZRender 提供的动画 API 来实现任意的动画

首先拿到 ZRender 实例：

```ts
const chart = echarts.init(/** ... */)
chart.setOptions({ /** ... */ })
const zr = chart.getZr()
```

然后通过 `zr.storage.getDisplayList()` 拿到所有的图形，这些图形是一个数组，每个图形都有动画[相关方法](https://ecomfe.github.io/zrender-doc/public/api.html#zrenderanimatable)：

```ts
const displayList = zr.storage.getDisplayList()

displayList.forEach((el) => {
  // 这里为简单演示，对所有没有动画的图形元素（柱体是有动画的）加一个过度效果
  if (!el.animators.length) {
    // https://ecomfe.github.io/zrender-doc/public/api.html#zrenderanimatable
    el.animateFrom(
      { style: { opacity: 0 } },
      {
        duration: 666,
      },
    )
  }
})
```

最终完整实现了案例效果
