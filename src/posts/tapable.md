---
container: Post
title: tapable
date: 2021/12/14
---

[[toc]]

## SyncHook

这是一个同步基础的钩子，类似最基础的事件发布订阅，这是一个简单使用的示例：

```js
import { SyncHook } from 'tapable'

// 需要指定形参
const hook = new SyncHook(['name', 'age'])

hook.tap('tap1', (name, age) => {
  console.log('tap1', name, age)
})

hook.tap('tap2', (name, age) => {
  console.log('tap2', name, age)
})

hook.call('zhangsan', 15)
```

Output: 
```
tap1 zhangsan 15
tap2 zhangsan 15
```

## SyncBailHook

这是一个同步保险钩子，在执行按顺序注册的事件处理函数中，如遇到有返回值（返回值为非 undefined）的事件处理函数，则会终止后续的事件处理函数执行，这是一个简单的使用示例：

```js
import { SyncBailHook } from 'tapable'

// 需要指定形参
const hook = new SyncBailHook(['name', 'age'])

hook.tap('tap1', (name, age) => {
  console.log('tap1', name, age)
})

hook.tap('tap2', (name, age) => {
  console.log('tap2', name, age)
  return null
})

hook.tap('tap3', (name, age) => {
  console.log('tap3', name, age)
})

hook.call('zhangsan', 15)
```

Output:

```
tap1 zhangsan 15
tap2 zhangsan 15
```

## SyncWaterfallHook

这是一个同步钩子，若在事件处理函数中若出现了返回值，则会将返回值作为新的参数值传递给后续的处理函数，这是一个简单使用的示例：

```js
import { SyncWaterfallHook } from 'tapable'

// 需要指定形参
const hook = new SyncWaterfallHook(['name', 'age'])

hook.tap('tap1', (name, age) => {
  console.log(name, age)
  return 'lishi'
})

hook.tap('tap2', (name, age) => {
  console.log(name, age)
})

hook.tap('tap3', (name, age) => {
  console.log(name, age)
})

hook.call('zhangsan', 15)
```

Output:

```
zhangsan 15
lishi 15
lishi 15
```

## SyncLoopHook

这是一个同步循环钩子，在顺序执行注册的事件函数中，如遇到有返回值的函数（非undefined），则会重头重新执行所有的事件处理函数，直至所有的处理函数都没有返回值，这是一个简单使用的示例：

```js
import { SyncLoopHook } from 'tapable'

const hook = new SyncLoopHook(['name', 'age'])

hook.tap('tap1', (name, age) => {
  console.log('tap1', name, age)
})

hook.tap('tap2', (name, age) => {
  console.log('tap2', name, age)
  return Math.random() < 0.3 ? undefined : 'hello world'
})

hook.tap('tap3', (name, age) => {
  console.log('tap3', name, age)
})

hook.call('zhangsan', 15)
```

Output:

```
tap1 zhangsan 15
tap2 zhangsan 15
tap1 zhangsan 15
tap2 zhangsan 15
tap1 zhangsan 15
tap2 zhangsan 15
tap3 zhangsan 15
```

因 tap2 中有几次都存在返回值，因此 tap1、tap2 执行了多次，直至 tap2 返回 undefined，即所有的函数都返回了 undefined，执行结束

## AsyncParallelHook

这是一个异步并行的钩子，它不关心返回值（丢弃返回值），并若有错误，会在第一次发生错误的时候进入错误流程

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncParallelHook } from 'tapable'

const hook = new AsyncParallelHook(['name'])

// 注册方式1
hook.tap('tap1', (name) => {
  console.log('tap1', name)
  return 'tap1 result'
})

// 注册方式2
// 1、在使用 callAsync 触发时，这里的 callback 指的就是 callAsync 第二个参数
// 2、在使用 promise 触发时，callback 遵守 Node 中错误传递机制，若第一个参数有值，则会走 Promise.prototype.catch
hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, 'tap2 result'), 0)
})

// 注册方式3
hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve('tap3 result')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callback err', err)
  console.log('callback args', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 lishi
tap2 lishi
tap3 lishi
callback err undefined
callback args []
then [ undefined ]
```

这是一个有错误发生的使用示例：

```js
import { AsyncParallelHook } from 'tapable'

const hook = new AsyncParallelHook(['name'])

// 注册方式1
hook.tap('tap1', (name) => {
  console.log('tap1', name)
  return 'tap1 result'
})

// 注册方式2
// 1、在使用 callAsync 触发时，这里的 callback 指的就是 callAsync 第二个参数
// 2、在使用 promise 触发时，callback 遵守 Node 中错误传递机制，若第一个参数有值，则会走 Promise.prototype.catch
hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback('tap2 error', 'tap2 result'), 0)
})

// 注册方式3
hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.reject(new Error('tap3 error'))
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callback err', err)
  console.log('callback args', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 lishi
tap2 lishi
tap3 lishi
callback err tap3 error
callback args []
catch tap3 error
```

以 `tap3 error` 进入错误流程，因为这里的微任务在宏任务之前执行

## AsyncParallelBailHook

这是一个异步并行保险的钩子，它会按照事件注册顺序，以第一个返回非 undefined 的值或错误作为结果进入后面流程

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncParallelBailHook } from 'tapable'

const hook = new AsyncParallelBailHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, 'tap2 reuslt'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve('tap3 reuslt')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync err', err)
  console.log('callAsync args', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 lishi
tap2 lishi
tap3 lishi
callAsync err null
callAsync args [ 'tap2 reuslt' ]
then [ 'tap2 reuslt' ]
```

即使 tap3 也返回了值并在 tap2 先返回，但还是按照事件注册顺序来进入后面流程

这是一个有错误发生的使用示例

```js
import { AsyncParallelBailHook } from 'tapable'

const hook = new AsyncParallelBailHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback('tap2 error', 'tap2 reuslt'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.reject(new Error('tap3 error'))
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync err', err)
  console.log('callAsync args', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 lishi
tap2 lishi
tap3 lishi
callAsync err tap2 error
callAsync args []
catch tap2 error
```

同理即使 tap3 也返回了错误且比 tap2 先返回，但还是按照事件注册顺序来进入后面流程

## AsyncSeriesHook

这是一个异步串行的钩子，会按照事件注册顺序依次执行（等待上一个事件函数处理完成再进行下一个），它不关心返回值（丢弃返回值） 若其中一个事件处理函数返回错误则中止并传递错误

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncSeriesHook } from 'tapable'

const hook = new AsyncSeriesHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, 'tap2 result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve('tap3 result')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap1 lishi
tap2 lishi
tap3 zhangsan
callAsync error undefined
callAsync result []
tap3 lishi
then [ undefined ]
```

输出结果有点乱，是因为是事件循环的结果，但依然满足在上一个事件函数执行完成后再执行下一个事件处理函数的特点

这是一个有错误发生的使用示例：

```js
import { AsyncSeriesHook } from 'tapable'

const hook = new AsyncSeriesHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback('tap error', 'tap2 result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve('tap3 result')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap1 lishi
tap2 lishi
callAsync error tap error
callAsync result []
catch tap error
```

在 tap2 中，返回了一个错误，则在此处会终止执行并进入后续流程（tap3 不会执行）

## AsyncSeriesBailHook

这是一个异步串行保险钩子，按事件处理函数注册顺序依次执行，并在有结果返回或错误时中止

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncSeriesBailHook } from 'tapable'

const hook = new AsyncSeriesBailHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, 'tap2 result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve()
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync err', err)
  console.log('callAsync result', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap1 lishi
tap2 lishi
callAsync err null
callAsync result [ 'tap2 result' ]
then [ 'tap2 result' ]
```

tap2 中返回了值（非undefined），因此 tap3 没有执行

这是一个有错误发生的使用示例：

```js
import { AsyncSeriesBailHook } from 'tapable'

const hook = new AsyncSeriesBailHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback('tap2 error', 'tap2 result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve()
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync err', err)
  console.log('callAsync result', args)
})

hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap1 lishi
tap2 lishi
callAsync err tap2 error
callAsync result []
catch tap2 error
```

tap2 出现了错误，中止执行

## AsyncSeriesLoopHook

这是一个异步串行循环钩子，会按照事件注册顺序依次执行，若在事件处理函数中若出现了返回值，则会重头重新执行所有的事件处理函数，直至所有的处理函数都没有返回值

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncSeriesLoopHook } from 'tapable'

const hook = new AsyncSeriesLoopHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, Math.random() < 0.3 ? undefined : 'tap2 result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve(Math.random() < 0.3 ? undefined : 'tap3 reuslt')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

// hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 zhangsan
tap2 zhangsan
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
tap1 zhangsan
tap2 zhangsan
tap3 zhangsan
callAsync error undefined
callAsync result []
```

只要在事件处理函数中有非 undefined 返回值，则会一直重复从头开始执行

这是一个有错误发生的使用示例：

```js
import { AsyncSeriesLoopHook } from 'tapable'

const hook = new AsyncSeriesLoopHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(Math.random() < 0.7 ? null : 'tap2 error', 'tap result'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve(Math.random() < 0.3 ? undefined : 'tap3 reuslt')
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

// hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
tap1 zhangsan
tap2 zhangsan
tap1 zhangsan
tap2 zhangsan
tap1 zhangsan
tap2 zhangsan
callAsync error tap2 error
callAsync result []
```

同理在有返回值的时候会重复重头开始执行，但在出现错误后中止执行

## AsyncSeriesWaterfallHook

这是一个异步串行的钩子，会按照事件注册的顺序依次执行，若在事件处理函数中若出现了返回值，则会将返回值作为新的参数值传递给后续的处理函数

有三种事件注册的方式：

+ tap
+ tapAsync
+ tapPromise

有两种事件触发的方式：

+ callAsync
+ promise

这是一个没有错误发生的使用示例：

```js
import { AsyncSeriesWaterfallHook } from 'tapable'

const hook = new AsyncSeriesWaterfallHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback(null, 'lishi'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve()
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

// hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output: 

```
tap1 zhangsan
tap2 zhangsan
tap3 lishi
callAsync error null
callAsync result [ 'lishi' ]
```

这是一个有错误发生的使用示例：

```js
import { AsyncSeriesWaterfallHook } from 'tapable'

const hook = new AsyncSeriesWaterfallHook(['name'])

hook.tap('tap1', (name) => {
  console.log('tap1', name)
})

hook.tapAsync('tap2', (name, callback) => {
  console.log('tap2', name)
  setTimeout(() => callback('tap2 error', 'lishi'), 0)
})

hook.tapPromise('tap3', (name) => {
  console.log('tap3', name)
  return Promise.resolve()
})

hook.callAsync('zhangsan', (err, ...args) => {
  console.log('callAsync error', err)
  console.log('callAsync result', args)
})

// hook.promise('lishi').then((...args) => console.log('then', args)).catch(err => console.log('catch', err))
```

Output:

```
tap1 zhangsan
tap2 zhangsan
callAsync error tap2 error
callAsync result []
```
