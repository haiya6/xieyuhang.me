---
container: Post
title: Unicode & UTF-8 & UTF-16 & UTF-32
date: 2021/8/15
---

[[toc]]

## Unicode 字符集

Unicode 字符集给世界上的一些语言、符号做了整理，每一个字符对应着唯一一个整数，可在 [Unicode Table](https://unicode-table.com) 查看。

Unicode 字符集中最大码点是 0x10FFFF 也就是十进制的 1114111，其中一些常用的字符处于 0 - 0xFFFF（十进制：65535）中，称为**基本多语言平面（BMP）**，而大于 0xFFFF 即 0x10000 - 0x10FFFF 中是一些**补充平面**，这是一些名词概念。

JavaScript 中，在 ES6 之前，查询某一个码点对应的字符可使用 `String.fromCharCode()`，但此方法只正常生效于小于 0x10000 的码点即 BMP 中，但在 ES6 提供的 [`String.fromCodePoint()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint) 则弥补了这一不足：

```ts
String.fromCodePoint(0x20BB7)
// 𠮷
```

与这个方法功能相反的方法：查询某一个字符对应的码点，在 ES6 之前，可使用 `String.prototype.charCodeAt()`，同样该方法也只正常生效于小于 0x10000 的码点即 BMP 中，但在 ES6 提供的 [`String.prototype.codePointAt()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt) 则弥补了这一不足：

```ts
let s = '𠮷a'

console.log(s.length)
// 3

console.log(s.codePointAt(0).toString(16))
// 0x20bb7
console.log(s.codePointAt(1).toString(16))
// 0xdfb7
console.log(s.codePointAt(2).toString(16))
// 0x61
```

不过 `codePointAt()` 参数看起来依然不是很正确，这是因为 `String.prototype.codePointAt()` 方法的返回值在 MDN 上的解释是在字符串中的给定索引的**编码单元**体现的数字，在 JavaScript 字符串内部使用的是 UTF-16 编码，UTF-16 编码的编码单元为 2 个字节（理解为最低用 2 个字节来表示一个字符），而 `𠮷` 是大于 0xFFFF 码点的字符（其码点占用 3 个字节），因此在 UTF-16 编码中占用 2 个编码单元（4 个字节），`s.codePointAt(0)` 找到第一个编码单元，而第一个编码单元体现的数字 `𠮷` 的码点（如何体现？参照下方 UTF-16 一节），而 `s.codePointAt(1)` 找到的是第二个编码单元，即 `𠮷` 通过 UTF-16 编码的后一个单元（后 2 个节点），因此返回了这个单元表示的数值。

> 上面解释也是 `s.length === 3` 的原因，变量 `s` 中有 3 个编码单元

解决上述问题一个办法是使用 `for...of` 循环，它会正确的识别出 UTF-16 中占用两个编码单元的字符：

```ts
const s = '𠮷a'

for (const ch of s) {
  console.log(ch.codePointAt(0).toString(16))
  // 0x20bb7
  // 0x61
}
```

另一种方法是使用扩展运算符 `...` 进行展开运算：

```ts
[...'𠮷a'].forEach(ch => {
  console.log(ch.codePointAt(0).toString(16))
  // 0x20bb7
  // 0x61
})
```

## UTF-32

> [32-bit Unicode Transformation Format](https://en.wikipedia.org/wiki/UTF-32)

UTF-32 编码通过固定的 4 个字节来表示一个字符，Unicode 字符集中的所有字符都能存储，但会浪费很多的空间，如字符 `a` 的码点是十进制 97，占用一个字节，而在 UTF-32 中依然需要通过 4 个字节来表示，这样对于网络传输也是一种负担。

## UTF-16

> [16-bit Unicode Transformation Format](https://en.wikipedia.org/wiki/UTF-16)，是 JavaScript 中字符串的编码类型

UTF 16 编码对于

+ BMP 中码点在  0x0000 - 0xD7FF 和 0xE000 - 0xFFFF（中间部分 0xD800 - 0xDFFF 事实上是空白不表示任何字符，且有其它用途，下文介绍）通过一个编码单元来表示（2 个字节），且数值等于相应的码点；

+ 对于补充平面 0x010000 - 0x10FFFF 的码点通过 2 个编码单元（4 个字节）来表示，且为了体现出这 2 个编码单元是有联系的（针对 UTF-16 编码反解析时要一起解析），将通过以下方案生成一对**代理对**：
  1. 将码点（U）减去 0x10000（补充平面开始处），将会在十六进制范围 0x00000 – 0xFFFFF （即最大码点 0x10FFFF - 0x10000 最大值为 0xFFFFF）中留下一个 20 位（二进制 20 位）的数字（U'）；
  2. 将 U' 的高十位加上 0xD800 （上述 BMP 中的空白区域开始处）得出一个编码单元，称为高代理项（W1），W1 将在 0xD800 – 0xDBFF 范围内；
  3. 将 U' 的低十位加上 0xDC00 （上述 BMP 中的空白区域中点）得出一个编码单元，称为低代理项（W2），W2 将在 0xDC00 – 0xDFFF 范围内。

  ```txt
  U' = yyyyyyyyyyxxxxxxxxxx // U - 0x10000 
  W1 = 110110yyyyyyyyyy // 0xD800 + yyyyyyyyyy 
  W2 = 110111xxxxxxxxxx // 0xDC00 + xxxxxxxxxx
  ```

一些例子：

| 字符 | Unicode 码点 |                   二进制 |                           二进制 UTF-16 |
| :--: | :----------: | -----------------------: | --------------------------------------: |
|  $   |    U+0024    |      0000 0000 0010 0100 |                     0000 0000 0010 0100 |
|  €   |    U+20AC    |      0010 0000 1010 1100 |                     0010 0000 1010 1100 |
|  𐐷   |   U+10437    | 0001 0000 0100 0011 0111 | 1101 1000 0000 0001 1101 1100 0011 0111 |
|  𤭢  |   U+24B62    | 0010 0100 1011 0110 0010 | 1101 1000 0101 0010 1101 1111 0110 0010 |

## UTF-8

> [8-bit Unicode Transformation Format](https://en.wikipedia.org/wiki/UTF-8)

UTF-8 将码点编码为一到四个字节，有以下转换表：

> 表中具体数字是固定格式，与 UTF-16 类似，是为了在反解析 UTF-8 时知道哪些字节是有联系的
>
> 用 1 个字节表示时，该字节的是 0 开头
>
> 用 n 个字节表示时，首字节的是 （n 个 1） + （1 个 0）开头，后面的字节以 10 开头

| Unicode 码点开始处 | Unicode 码点结束处 | 字节1 | 字节2 | 字节3 | 字节4 |
| :------------------: | :----------------: | :-------: | :-------: | :-------: | :-------: |
|        U+0000        |       U+007F       | 0xxxxxxx  |           |           |           |
|        U+0080        |       U+07FF       | 110xxxxx  | 10xxxxxx  |           |           |
|        U+0800        |       U+FFFF       | 1110xxxx  | 10xxxxxx  | 10xxxxxx  |           |
|       U+10000        |      U+10FFFF      | 11110xxx  | 10xxxxxx  | 10xxxxxx  | 10xxxxxx  |

编码过程如下：
  1. 判断码点（U）在哪个区间，将 U 的二进制位从后往前截取对应的部分填入上表中的 `x` 中。

一些例子：

| 字符 | Binary code point |               Binary UTF-8 |                           Hex UTF-8 |
| :--: | :---------------: | -------------------------: | ----------------------------------: |
|  $   |      U+0024       |                   010 0100 |                            00100100 |
|  £   |      U+00A3       |              000 1010 0011 |                   11000010 10100011 |
|  ह   |      U+0939       |        0000 1001 0011 1001 |          11100000 10100100 10111001 |
|  €   |      U+20AC       |        0010 0000 1010 1100 |          11100010 10000010 10101100 |
|  한  |      U+D55C       |        1101 0101 0101 1100 |          11101101 10010101 10011100 |
|  𐍈   |      U+10348      | 0 0001 0000 0011 0100 1000 | 11110000 10010000 10001101 10001000 |
