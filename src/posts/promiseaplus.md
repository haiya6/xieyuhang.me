---
container: Post
title: 根据 Promises/A+ 实现 Promise
date: 2022/7/27
---

> 规范：[Promises/A+](https://promisesaplus.com/)，测试工具：[promises-tests](https://github.com/promises-aplus/promises-tests)，此篇文章中的代码 GitHub 仓库地址：[MyPromise](https://github.com/haiya6/notes/tree/main/promise)

此篇文章将在 Node 环境通过 `Class` 语法来实现一个符合 Promises/A+ 规范的 `MyPromise`，通过官方 872 个测试用例

> 文章中 x.x.x 标记如 2.1.1 表示规范中对应的规范序号；`myPromise` 表示 `MyPromise` 的一个实例对象

【2.1】MyPromise 将有 3 个状态：
  + 【2.1.1】pending：`myPromise` 的状态还没发生改变，接下来可变为完成态（fulfilled）或拒绝态（rejected）
  + 【2.1.2】fulfilled：`myPromise` 处于成功态，该状态将不能继续发生改变，且将拥有一个不可变的值（value）
  + 【2.1.3】rejected：`myPromise` 处于拒绝态，该状态将不能继续发生改变，且将拥有一个不可变的拒因（reason）

初始状态为 pending

```js
const PENDING = Symbol('PENDING')
const FULFILLED = Symbol('FULFILLED')
const REJECTED = Symbol('REJECTED')

class MyPromise {
  state = PENDING

  // value or reason
  result
}
```

MyPromise 构造函数接受一个函数参数 `func`：
  + `func` 会在 MyPromise 被初始化时立即同步执行
  + `func` 会接受两个函数参数：`resolve`、`reject` 分别用来将 `myPromise` 的状态改变为 `fulfilled` 和 `rejected`
  + `func` 在若在执行时抛出一个异常 `e`，将会以 `e` 来 reject `myPromise`

```js
const PENDING = Symbol('PENDING')
const FULFILLED = Symbol('FULFILLED')
const REJECTED = Symbol('REJECTED')

class MyPromise {
  state = PENDING

  // value or reason
  result

  constructor(func) {
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)

    try {
      func(this.resolve, this.reject)
    } catch(e) {
      this.reject(e)
    }
  }

  resolve() {
    // TODO 将 myPromise 的状态变为 fulfilled
  }

  reject() {
    // TODO 将 myPromise 的状态变为 rejected
  }
}
```

【2.2】MyPromise 将提供一个 `then` 方法，来访问 MyPromise 的当前或最终值（value）或拒因（reason），`then` 方法接收两个参数：

```js
myPromise.then(onFulfilled, onRejected)
```

【2.2.1】`onFulfilled` 与 `onRejected` 都是可选项
  + 【2.2.1.1】`onFulfilled` 若不是一个函数，将被忽略
  + 【2.2.1.2】`onRejected` 若不是一个函数，将被忽略

【2.2.2】若 `onFulfilled` 是一个函数
  + 【2.2.2.1】当 `myPromise` 的状态处于 fulfilled 时将被调用，且将 `myPromise` 的 value 作为 `onFulfilled` 的第一个参数
  + 【2.2.2.2】当 `myPromise` 的状态没有处于 fulfilled 时将不能被调用
  + 【2.2.2.3】`onFulfilled` 只能被调用一次

【2.2.3】若 `onRejected` 是一个函数
  + 【2.2.3.1】当 `myPromise` 的状态处于 rejected 时将被调用，且将 `myPromise` 的 reason 作为 `onRejected` 的第一个参数
  + 【2.2.3.2】当 `myPromise` 的状态没有处于 rejected 时将不能被调用
  + 【2.2.3.3】`onRejected` 只能被调用一次

【2.2.4】`onFulfilled` 或 `onRejected` 将异步调用，应在 `then` 方法调用的那一轮事件循环之后的新执行栈中执行，可以采用宏任务（macro-task）机制也可采用微任务（micro-task）机制，因本篇文章是在 Node 环境中，因此采用 `process.nextTick` API 将任务放置在微任务队列中执行

【2.2.5】`onFulfilled` 或 `onRejected` 将作为普通函数调用，即没有 `this` 指向

【2.2.6】`then` 可以在同一个 `myPromise` 上被调用多次
  + 【2.2.6.1】当 `myPromise` 的状态变为 fulfilled，所有的 `onFulfilled` 回调将按照他们对 `then` 的原始调用的顺序执行
  + 【2.2.6.2】当 `myPromise` 的状态变为 rejected，所有的 `onRejected` 回调将按照他们对 `then` 的原始调用的顺序执行

【2.2.7】`then` 将返回一个 MyPromise：

```js
myPromise2 = myPromise1.then(onFulfilled, onRejected)
```
  + 【2.2.7.1】如 `onFulfilled` 或 `onRejected` 返回一个值 `x`，则运行 `[[Resolve]](myPromise2, x)` 的解决过程（在代码中详解，即 `resolvePromise` 函数）
  + 【2.2.7.2】如 `onFulfilled` 或 `onRejected` 抛出一个异常 `e`，`myPromise2` 将以 `e` 为拒因状态变为 rejected
  + 【2.2.7.3】如 `onFulfilled` 不是一个函数且 `myPromise1` 处于 fulfilled 状态，则 `myPromise2` 将以与 `myPromise1` 相同的 value 来 fulfilled
  + 【2.2.7.4】如 `onRejected` 不是一个函数且 `myPromise1` 处于 rejected 状态，则 `myPromise2` 将以与 `myPromise1` 相同的 reason 来 rejected

```js
const PENDING = Symbol('PENDING')
const FULFILLED = Symbol('FULFILLED')
const REJECTED = Symbol('REJECTED')

function resolvePromise(myPromise2, x, resolve, reject) {
  // 2.3.1 如果 myPromise2 和 x 指向同一对象，则以一个 TypeError 为 reason 来 reject myPromise1
  if (x === myPromise2) {
    return reject(new TypeError('巴拉巴拉'))
  }
  // 2.3.2 如果 x 是 MyPromise 实例，则使 myPromise2 采用 x 的状态，具体如下
  if (x instanceof MyPromise) {
    // 2.3.2.1 如果 x 处于 pending， myPromise2 需保持挂起，直到 x 被 fulfilled 或 rejected
    if (x.state === PENDING) {
      x.then(
        y => {
          // 将 value: y 再调用 resolvePromise
          resolvePromise(myPromise2, y, resolve, reject)
        },
        reject
      )
    } else if (x.state === FULFILLED) {
      // 2.3.2.2 当 x 状态为 fulfilled 时，以 x.result 为 value 来 resolve myPromise1
      resolve(x.result)
    } else {
      // rejected
      // 2.3.2.3 当 x 状态为 rejected, ，以 x.result 为 reason 来 reject myPromise1
      reject(x.result)
    }
  } else if (typeof x === 'function' || (x !== null && typeof x === 'object')) {
    // 2.3.3 如果是 object or function

    // 2.3.3.1 定义变量 `then`，尝试赋值为 `x.then`
    // 2.3.3.2 如果取 `x.then` 的值时抛出异常 `e` ，则以 `e` 为据因 reject myPromise1
    let then
    try {
      then = x.then
    } catch (e) {
      return reject(e)
    }
    // 2.3.3.3 如果 `then` 是一个函数，调用 `then` 并修改 this 为 `x`
    // 第一个参数为 _resolvePromise，第二个参数为 _rejectPromise
    if (typeof then === 'function') {
      let called = false

      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 _resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](myPromise2, y)
          y => {
            // 2.3.3.3.3 如果 _resolvePromise 和 _rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            if (!called) {
              called = true
              resolvePromise(myPromise2, y, resolve, reject)
            }
          },
          // 2.3.3.3.2 如果 _rejectPromise 以值 r 为参数被调用，则以 r 为拒因 reject myPromise1
          r => {
            // 2.3.3.3.3 如果 _resolvePromise 和 _rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            if (!called) {
              called = true
              reject(r)
            }
          }
        )
      } catch (e) {
        // 2.3.3.3.4 如果调用 then 方法抛出了异常 e
        // 2.3.3.3.4.1 如果 _resolvePromise 或 _rejectPromise 已经被调用，则忽略之
        if (called) return
        // 2.3.3.3.4.2 否则以 `e` 为据因 reject myPromise1
        reject(e)
      }
    } else {
      // 2.3.3.4 如果 `then` 不是函数，以 x 为参数 resolve myPromise1
      resolve(x)
    }
  } else {
    // 2.3.4 如果 x 不为对象或者函数，以 x 为参数 resolve myPromise1
    resolve(x)
  }
}

class MyPromise {
  state = PENDING

  // value or reason
  result

  onFulfilledCallbacks = []
  onRejectedCallbacks = []

  constructor(func) {
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)

    try {
      func(this.resolve, this.reject)
    } catch (err) {
      this.reject(err)
    }
  }

  resolve() {
    // TODO 将 MyPromise 的状态变为 fulfilled
  }

  reject() {
    // TODO 将 MyPromise 的状态变为 rejected
  }

  then(onFulfilled, onRejected) {
    // 2.2.7.3
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    // 2.2.7.4
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }

    const myPromise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = value => {
        try {
          const x = onFulfilled(value)
          // 2.2.7.1
          resolvePromise(myPromise2, x, resolve, reject)
        } catch (e) {
          // 2.2.7.2
          reject(e)
        }
      }

      const handleRejected = reason => {
        try {
          const x = onRejected(reason)
          // 2.2.7.1
          resolvePromise(myPromise2, x, resolve, reject)
        } catch (err) {
          // 2.2.7.2
          reject(err)
        }
      }

      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(handleFulfilled)
        this.onRejectedCallbacks.push(handleRejected)
      } else if (this.state === FULFILLED) {
        // 2.2.4
        process.nextTick(() => {
          handleFulfilled(this.result)
        })
      } else {
        // rejected

        // 2.2.4
        process.nextTick(() => {
          handleRejected(this.result)
        })
      }
    })

    // 2.2.7
    return myPromise2
  }
}
```

最终实现 `resolve` 及 `reject` 方法

```js
class MyPromise {
  // ...
  resolve(value) {
    if (this.state === PENDING) {
      // 2.2.4
      process.nextTick(() => {
        this.result = value
        this.state = FULFILLED
        this.onFulfilledCallbacks.splice(0).forEach(cb => cb(value))
      })
    }
  }

  reject(reason) {
    if (this.state === PENDING) {
      // 2.2.4
      process.nextTick(() => {
        this.result = reason
        this.state = REJECTED
        this.onRejectedCallbacks.splice(0).forEach(cb => cb(reason))
      })
    }
  }
  // ...
}
```
