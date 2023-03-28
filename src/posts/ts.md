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

## 函数的协变和逆变

> 随着某一个量的变化，随之变化一致的称为协变，而变化相反的即称为逆变。

函数类型的参数类型使用子类型逆变的方式确定是否成立，而返回值类型使用子类型协变的方式来确定。

```ts
class Animal {
  asPet() {}
}

class Dog extends Animal {
  bark() {}
}

class Corgi extends Dog {
  cute() {}
}
```

```ts
type AsFuncArgType<T> = (arg: T) => void
type AsFuncReturnType<T> = (arg: unknown) => T

// true，这是因为函数的返回值类型是通过协变的方式来确定的
type CheckReturnType = AsFuncReturnType<Corgi> extends AsFuncReturnType<Dog>
  ? true
  : false

// false，这是因为函数的参数类型是通过逆变的方式来确定的
type CheckArgType = AsFuncArgType<Dog> extends AsFuncArgType<Animal> ? true : false
```

再看一个例子：

```ts
function fn(dog: Dog) {
  dog.bark()
}

type CorgiFunc = (input: Corgi) => void
type AnimalFunc = (input: Animal) => void

// success
const func1: CorgiFunc = fn
// error，若想 typeof fn 成为 AnimalFunc 的子类型，那么 typeof fn 的参数必须是 AnimalFunc 参数的父类型（参数逆变）
const func2: AnimalFunc = fn
```

这一特性可以通过 [`strictFunctionTypes`](https://www.typescriptlang.org/tsconfig#strictFunctionTypes) 配置，若不开启此选项，函数参数的检查采用的是双变，即逆变和协变都可以被接受。
