---
container: Post
title: TypeScript 小笔记
date: 2023/03/23
---

[[toc]]

## 分布式条件类型

对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。看下面一个例子：

```ts
type Naked<T> = T extends boolean ? 'Y' : 'N'

// 'Y' | 'N'
type Result = Naked<number | boolean>
```

当 `number | boolean` 通过**泛型**传入给 `Naked<T>` 时，会将 `number` 和 `boolean` 分别进行 `T extends boolean` 判断，因此结果返回的是一个两个结果的联合类型

通过将参数和条件都“包裹”起来，这种情况就不会发生：

```ts
type CompareUnion<T> = [T] extends [1 | 2 | 3] ? true : false

// true
type Result2 = CompareUnion<1 | 2>
```
