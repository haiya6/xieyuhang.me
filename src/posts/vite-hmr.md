---
container: Post
title: Vite HMR
date: 2022/9/1
---

> HMR: Hot Module Replacement

> Vite Version: ^4.0.1

Vite 通过 `import.meta.hot` 对象来暴露 HMR 相关的 API，且使用该对象时，需要通过一个条件判断来确保 HMR API 的正确使用，这样也可以在生产环境中被 tree-shaking 优化

```ts
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

## 接受自身模块的更新

通过 `import.meta.hot.accept` API，第一个参数给回调函数，这样在当前模块发生更新时该回调函数会触发，回调函数中的第一个参数为新的模块：

**helper.ts**

```ts
export function add(a: number, b: number) {
  return a + b
}

if (import.meta.hot) {
  import.meta.hot.accept(newModule => {
    // 在 helper.ts 内容发生变化时，会运行此回调，newModule 即为当前的最新模块对象
    console.log(newModule.add(2, 3))
  })
}
```

在 Vite 中，接受 HMR 的模块被称为 HMR 边界，从边界模块向上的导入者将不会收到更新。例在上面的 `helper.ts` 中，在模块内部已处理了当前模块的 HMR，此模块就是 HMR 边界，如有依赖 `helper.ts` 的模块 `main.ts` 也处理了对 `helper.ts` 的更新（通过下方会介绍的方法），则当 `helper.ts` 模块发生改变时，只会触发 `helper.ts` 中的挂载的回调，而在 `main.ts` 中挂载的回调则**不会**触发。

`import.meta.hot.accept` 也可不指定参数，在模块内容发生变化时会执行模块内容，且指定了当前模块是 HMR 边界模块。

```ts
console.log('hello')

if (import.meta.hot) {
  import.meta.hot.accept()
}
```

## 接受直接依赖项的更新

通过 `import.meta.hot.accept` API，还可以接受直接依赖项的更新

**module.ts**

```ts
import { add } from './helper'

function main() {
  console.log(add(1, 2))
}

main()

if (import.meta.hot) {
  import.meta.hot.accept('./helper', newHelper => {
    // 若 helper.ts 模块发生变化，则此回调会运行，且有一个前提是：
    // 在 helper.ts 模块内部没有处理对自身的 HMR，即 helper.ts 不是边界模块
    debugger
  })
}
```

`import.meta.hot.accept` 第一个参数依赖项也可以是一个数组，即接受多个模块的更新：

```ts
import { add } from './helper'
import { request } from './request'

function main() {
  request()
  add(1, 2)
}

main()

if (import.meta.hot) {
  import.meta.hot.accept(['./helper', './request'], ([newHelper, newRequest]) => {
    // 当 helper.ts 模块发生变化时，newHelper 即为新的模块内容，newRequest 为 undefined
    // 当 request.ts 模块发生变化时，newHelper 为 undefined，newRequest 即为新的模块内容
    debugger
  })
}
```

## 注册清除副作用回调

可以注册一个回调，在自身模块被更新前调用，在这里可以做一些清除操作

```ts
export function add(a: number, b: number) {
  return a + b
}

if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    // 2
    debugger
  })
  import.meta.hot.dispose(data => {
    // 1
    // data 即 `import.meta.hot.data`
    debugger
  })
}
```

## 模块数据传递

`import.meta.hot.data` 对象在同一个更新模块的不同实例之间持久化。它可以用于将信息从模块的前一个版本传递到下一个版本。
