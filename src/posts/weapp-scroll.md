---
container: Post
title: 微信小程序中基于WXS实现回弹的平滑滚动容器
date: 2022/7/12
---

[[toc]]

> GitHub: [weapp-scroll](https://github.com/haiya6/weapp-scroll)

## 前言

最近在愉快的开发微信小程序的时候碰到了一个体验需求，需要在 Android 侧的滚动也需要带回弹效果，类似于在 Web 端可以使用的 [better-scroll](https://github.com/ustbhuangyi/better-scroll)，查阅微信小程序内置组件 `scroll-view` 无法满足这种场景，没办法，需求得做呀，只能自己动手撸了！

在微信小程序中，我们可以通过 [WXS响应事件](https://developers.weixin.qq.com/miniprogram/dev/framework/view/interactive-animation.html) 来替代逻辑层处理从而有效的提高交互流畅度，其中使用到的 [WXS语法](https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/) 也是非常类似我们非常熟悉 JavaScript，不过很多的 JavaScript 高级语法在 WXS 模块中不能使用，具体可以点击链接进入微信小程序提供的文档。

## 思路

以横向滚动为例，内容的宽度大于容器的宽度时可以发生滚动，如图

![weapp-scroll-a](/imgs/weapp-scroll-a.png)

接着通过监听三个触摸事件`touchstart`、`touchmove`、`touchend`来实时的改变 content 的 CSS translate，从而从视觉上达到滚动的目的。

## WXS 示例

我们先从一个简单的 WXS 使用示例来了解回顾一下使用方式，WXS 的模块系统类似 CommomJS 规范，使用每个模块内置的 `module` 对象中的 `exports` 属性进行变量、函数导出：
```js
// helper.wxs
module.exports = {
  // 注意 WXS 模块中不支持函数简写
  touchstart: function touchstart() {
    console.log('touchstart called')
  }
}
```
```html
<!-- index.wmxl -->
<!-- module 为模块名，可按规范任意取名 -->
<wxs src="./helper.wxs" module="helper" />

<!-- 与普通的逻辑层事件不同，这里需要加上 {{}} -->
<view bind:touchstart="{{ helper.touchstart }}">view</view>
```
这样就给 `view` 绑定了一个 `touchstart` 事件，在事件触发后，会在控制台打印出字符串 "touchstart called"
好了，现在正式进入滚动容器的逻辑实现

## 开工
新建 `scroll.wxml` 文件，准备符合上图中结构的 WXML 内容来构造出一个正确的可以滚动条件
```html
<!-- scroll.wxml -->
<!-- 即图中的 container -->
<view class="container" style="width: 100vw;">
  <!-- 即图中的 content -->
  <view class="content" style="display: inline-block; white-space: nowrap;">
    <view wx:for="{{ 10 }}" wx:key="index" style="width: 200rpx; height: 300rpx; border: 1px solid; display: inline-block;">{{ item }}</view>
  </view>
</view>
```

新建 `scroll.wxs` 文件，里边用于存放我们实现滚动的所有逻辑

接下来进行初始化操作，首先需要获取到 container 和 content 组件实例，在上一节 "WXS 示例" 中我们知道可以通过在组件中触发一个事件来调用 WXS 模块中的方法，但有没有什么方式可以不用等到用户来触发事件就可以执行吗？

通过阅读 [WXS 响应事件](https://developers.weixin.qq.com/miniprogram/dev/framework/view/interactive-animation.html) 文档，可以了解到，另外一种调用 WXS 模块方法就是可以通过 `change:[prop]` 监听某一个组件的 Prop 的改变来执行 WXS 模块中指定的方法，且这个方法会**立即执行**一次，如下面一个示例
```js
// helper.wxs
module.exports = {
  setup: function setup() {
    console.log('setup')
  }
}
```
```html
<!-- index.wxml -->
<wxs src="./helper.wxs" module="helper"></wxs>

<!-- 例如我们指定一个 prop 为 prop1，值为 {{ prop1Data }} -->
<!-- 通过 change:prop1 语法对这个 prop 的变化进行监听 -->
<view prop1="{{ prop1Data }}" change:prop1="{{ helper.setup }}"></view>
```
```js
// index.js
Page({
  data: {
    prop1Data: {}
  }
})
```
上面示例中，在页面初始化或 `prop1Data` 发生改变时（准确来说是在逻辑层对 `prop1Data` 调用了 `setData` 方法后，即使 `prop1Data` 的内容不变化），都会调用 `hepler.wxs` 模块中的 setup 方法。

现在我们可以通过 `change:prop` 会立即执行一次的特点，来对我们的滚动逻辑进行一次初始化操作
```js
// scroll.wxs
const exports = module.exports

// 页面实例
let ownerInstance

// container BoundingClientRect
let containerRect

// content 实例，通过此实例设置 CSS 属性
let slidingContainerInstance

// content BoundingClientRect
let slidingContainerRect

// X方向的最小、最大滚动距离。如 -200 至 0（手势往右时，元素左移，translateX 为负值）
let minTranslateX
const maxTranslateX = 0

/**
 * @param newValue 最新的属性值
 * @param oldValue 旧的属性值
 * @param _ownerInstance 页面所在的实例
 * @param instance 触发事件的组件实例
 */
exports.setup = function setup(newValue, oldValue, _ownerInstance, instance) {
  ownerInstance = _ownerInstance
  containerRect = instance.getBoundingClientRect()
  slidingContainerInstance = ownerInstance.selectComponent('.content')
  slidingContainerRect = slidingContainerInstance.getBoundingClientRect()

  minTranslateX = (slidingContainerRect.width - containerRect.width) * -1
}
```
```html
<!-- scroll.wxml -->
<wxs src="./scroll.wxs" module="scroll" />

<!-- 因本案例只利用 change:[prop] 首次执行的机制，传递的给 _ 的参数是个对象字面量 -->
<view
  class="container"
  style="width: 100vw;"
  _="{{ { k: '' } }}"
  change:_="{{ scroll.setup }}"
  bind:touchstart="{{ scroll.touchstart }}"
  bind:touchmove="{{ scroll.touchmove }}"
  bind:touchend="{{ scroll.touchend }}"
>
  <view class="content" style="display: inline-block; white-space: nowrap;">
    <view wx:for="{{ 10 }}" wx:key="index" style="width: 200rpx; height: 300rpx; border: 1px solid; display: inline-block;">{{ item }}</view>
  </view>
</view>
```

### 完成基本的跟随手指移动
```js
// scroll.wxs
const exports = module.exports

// 页面实例
let ownerInstance

// container BoundingClientRect
let containerRect

// content 实例，通过此实例设置 CSS 属性
let slidingContainerInstance

// content BoundingClientRect
let slidingContainerRect

// X方向的最小、最大滚动距离。如 -200 至 0（手势往右时，元素左移，translateX 为负值）
let minTranslateX
const maxTranslateX = 0

/**
 * @param newValue 最新的属性值
 * @param oldValue 旧的属性值
 * @param _ownerInstance 页面所在的实例
 * @param instance 触发事件的组件实例
 */
exports.setup = function setup(newValue, oldValue, _ownerInstance, instance) {
  ownerInstance = _ownerInstance
  containerRect = instance.getBoundingClientRect()
  slidingContainerInstance = ownerInstance.selectComponent('.content')
  slidingContainerRect = slidingContainerInstance.getBoundingClientRect()

  minTranslateX = (slidingContainerRect.width - containerRect.width) * -1
}

// 实时记录 content 位置
const pos = { x: 0 }

// 记录每次触摸事件开始时，content 的位置，后续的移动都是基于此值增加或减少
const startPos = { x: 0 }

// 记录触摸开始时，手指的位置，后续需要通过比较此值来计算出移动量
const startTouch = { clientX: 0 }

function setTranslate(pos0) {
  slidingContainerInstance.setStyle({
    transform: `translateX(${pos0.x}px)`
  })
  pos.x = pos0.x
}

exports.touchstart = function touchstart(event) {
  startTouch.clientX = event.changedTouches[0].clientX
  startPos.x = pos.x
}

exports.touchmove = function touchmove(event) {
  const deltaX = event.changedTouches[0].clientX - startTouch.clientX
  const x = startPos.x + deltaX

  setTranslate({ x })
}

exports.touchend = function touchend() {}
```

### 处理松手后移动超出的情况，需要对其归位：

添加 clamp 工具方法
```js
// 给出最小、最大、当前值，返回一个在最下-最大范围之间的结果
// 如： -100, 0, -101 => -100
function clamp(min, max, val) {
  return Math.max(min, Math.min(max, val))
}
```
在 touchend 事件中，添加位置校验的逻辑
```js
// scroll.wxs
exports.touchend = function touchend() {
  setTranslate({
    x: clamp(minTranslateX, maxTranslateX, pos.x)
  })
}
```

### 加上松手回弹动画

其中动画可以使用两种实现方式
+ CSS Transition：在松手后，给 content 元素设置一个 `transition`，然后调整  `translateX` 值归位
+ JS 帧动画：在松手后，利用动画函数不断调整 `translateX` 来进行归位

两种方式通过给相同的动画函数可以达到一样的体验，但 CSS Transition 在我的理解中不太好处理中止的情况，如在动画过程中，又有了新的触摸事件，这里就会产生抖动或未预期到的结果，但 JS 动画可以很简单的应对

因此后续的动画部分打算采用 JS 动画实现，先准备一些动画函数
```js
// scroll.wxs

// 下面内容通过 better-scroll 借鉴 ~
// 可以理解为入参是一个 [0, 1] 的值，返回也是一个 [0, 1] 的值，用来表示进度
const timings = {
  v1(t) {
    return 1 + --t * t * t * t * t
  },
  v2(t) {
    return t * (2 - t)
  },
  v3(t) {
    return 1 - --t * t * t * t
  }
}
```
定义 `moveFromTo` 方法来实现从一个点通过指定的动画函数运动到另一点
```js
// scroll.wxs

/**
 * @param fromX 起始点xx
 * @param toX 目标点 x
 * @param duration 持续时长
 * @param timing 动画函数
 */
function moveFromTo(fromX, toX, duration, timing) {
  if (duration === 0) {
    setTranslate({ x: fromX })
  }
  else {
    const startTime = Date.now()
    const disX = toX - fromX
    const rAFHandler = function rAFHandler() {
      const progressX = timing(clamp(0, 1, (Date.now() - startTime) / duration))

      setTranslate({
        x: disX * progressX + fromX
      })

      if (progressX < 1)
        ownerInstance.requestAnimationFrame(rAFHandler)
    }
    ownerInstance.requestAnimationFrame(rAFHandler)
  }
}
```
调整 touchend 事件处理逻辑，添加归位的动画效果
```js
// scroll.wxs
exports.touchend = function touchend() {
  moveFromTo(
    pos.x,
    clamp(minTranslateX, maxTranslateX, pos.x),
    800,
    timings.v1
  )
}
```

看起来达到了目的，再优化一下，在滑动超出边界后，需要给一些阻力，不能滑的“太简单了”

### 给超边界的滚动加阻力
```js
// scroll.wxs
exports.touchmove = function touchmove(event) {
  const deltaX = event.changedTouches[0].clientX - startTouch.clientX
  let x = startPos.x + deltaX
  // 阻尼因子
  const damping = 0.3

  if (x > maxTranslateX) {
    // 手指右滑导致元素左侧超出，超出部分添加阻尼行为
    x = maxTranslateX + damping * (x - maxTranslateX)
  }
  else if (x < minTranslateX) {
    // 手指左滑导致元素右侧超出，超出部分添加阻尼行为
    x = minTranslateX + damping * (x - minTranslateX)
  }

  setTranslate({ x })
}
```

到现在已经完成了一个带回弹效果的滚动容器，但还没有做到“平滑”，即在滑动一段距离松手后，需要给 content 一些“惯性”来继续移动一些距离，体验起来就不会那么生硬

### 加滑动惯性

在这之前，还有一些准备工作需要做
```diff
// scroll.wxs

// 记录触摸开始的时间戳
+ var startTimeStamp = 0

// 增加动画完成回调
+ function moveFromTo(fromX, toX, duration, timing, onComplete) {
  if (duration === 0) {
    setTranslate({ x: fromX })
+   ownerInstance.requestAnimationFrame(function() {
+     onComplete && onComplete()
+   })
  } else {
    var startTime = Date.now()
    var disX = toX - fromX
    var rAFHandler = function rAFHandler() {
      var progressX = timing(clamp(0, 1, (Date.now() - startTime) / duration))

      setTranslate({
        x: disX * progressX + fromX
      })

      if (progressX < 1) {
        ownerInstance.requestAnimationFrame(rAFHandler)
+     } else {
+       onComplete && onComplete()
+     }
    }
    ownerInstance.requestAnimationFrame(rAFHandler)
  }
}

exports.touchstart = function touchstart(event) {
  startTouch.clientX = event.changedTouches[0].clientX
  startPos.x = pos.x
+ startTimeStamp = event.timeStamp
}
```
因为是在松手后加动量，所以继续处理 touchend
```js
// scroll.wxs
exports.touchend = function touchend(event) {
  // 记录这一轮触摸动作持续的时间
  const eventDuration = event.timeStamp - startTimeStamp
  const finalPos = { x: pos.x }
  let duration = 0
  let timing = timings.v1
  const deceleration = 0.0015

  // 计算动量，以下计算方式“借鉴”于 better-scroll，有知道使用什么公式的朋友告知以下~
  const calculateMomentum = function calculateMomentum(start, end) {
    const distance = Math.abs(start - end)
    const speed = distance / eventDuration
    const dir = end - start > 0 ? 1 : -1
    const duration = Math.min(1800, (speed * 2) / deceleration)
    const delta = speed ** 2 / deceleration * dir

    return {
      duration,
      delta
    }
  }

  // 此次滑动目的地还在边界中，可以进行动量动画
  if (finalPos.x === clamp(minTranslateX, maxTranslateX, finalPos.x)) {
    const result = calculateMomentum(startPos.x, pos.x)

    duration = result.duration
    finalPos.x += result.delta

    // 加上动量后，超出了边界，加速运动到目的地，然后触发回弹效果
    if (finalPos.x > maxTranslateX || finalPos.x < minTranslateX) {
      duration = 400
      timing = timings.v2
      const beyondDis = containerRect.width / 6
      if (finalPos.x > maxTranslateX)
        finalPos.x = maxTranslateX + beyondDis
      else
        finalPos.x = minTranslateX + beyondDis * -1
    }
  }

  moveFromTo(pos.x, finalPos.x, duration, timing, () => {
    // 若动量动画导致超出了边界，需要进行位置修正，也就是回弹动画
    const correctedPos = { x: clamp(minTranslateX, maxTranslateX, pos.x) }
    if (correctedPos.x !== pos.x) {
      moveFromTo(
        pos.x,
        correctedPos.x,
        800,
        timings.v1
      )
    }
  })
}
```

只是现在的滚动容器还很“脆弱”，在进行动量动画、回弹动画时，如果手指继续开始一轮新的触摸，就会出现问题，也就是最开始我们在选择 CSS 过渡和 JS 动画考虑到的问题

### 解决连续触摸滑动问题

在 `moveFromTo` 方法中，添加强制中止的逻辑
```diff
// scroll.wxs

+ var effect = null

function moveFromTo(fromX, toX, duration, timing, onComplete) {
+ var aborted = false

  if (duration === 0) {
    setTranslate({ x: fromX })
    ownerInstance.requestAnimationFrame(function () {
      onComplete && onComplete()
    })
  } else {
    var startTime = Date.now()
    var disX = toX - fromX
    var rAFHandler = function rAFHandler() {
+     if (aborted) return
      var progressX = timing(clamp(0, 1, (Date.now() - startTime) / duration))

      setTranslate({
        x: disX * progressX + fromX
      })

      if (progressX < 1) {
        ownerInstance.requestAnimationFrame(rAFHandler)
      } else {
        onComplete && onComplete()
      }
    }
    ownerInstance.requestAnimationFrame(rAFHandler)
  }

+ if (effect) effect()
+ effect = function abort() {
+   if (!aborted) aborted = true
+ }
}

exports.touchstart = function touchstart(event) {
  startTouch.clientX = event.changedTouches[0].clientX
  startPos.x = pos.x
  startTimeStamp = event.timeStamp

+ if (effect) {
+   effect()
+   effect = null
+ }
}
```
体验一下：
<img src="/imgs/weapp-scroll-preview.gif" style="width: 30%;" />
