---
container: Post
title: 在基于 Webpack 的 Vue 项目中启用代码语法规范校验
date: 2023/2/11
---

[[toc]]

## ESLint

[ESLint](https://eslint.org/) 是常用的对 **JS/TS** 代码的编写规范检查及修复工具，在项目中可通过运行这个指令来安装及配置 ESLint：

```shell
npm init @eslint/config
```

运行此命令后，在命令行中会进行问答的方案来选择一些配置：

> 下面的示例是基于本文编写时最新的 ESLint 版本，你在实际操作中可能会与此不同

> 代码块在上，对应的解释文字在下

```shell
Need to install the following packages:
  @eslint/create-config
Ok to proceed? (y)
```

提示需安装 `@eslint/create-config` 包，直接回车，表示选择“是”

```shell
? How would you like to use ESLint? ...
  To check syntax only
> To check syntax and find problems
  To check syntax, find problems, and enforce code style
```

“如何使用 ESLint”，选择 `To check syntax and find problems`，检查语法并发现一些代码执行的潜在问题（如可能出现死循环等），这里的选择会影响到最终生成的配置文件内容，但如后面需要再调整也是非常的容易的

```shell
? What type of modules does your project use? ...
> JavaScript modules (import/export)
  CommonJS (require/exports)
  None of these
```

选择项目使用的模块语法，现在基本基本为 ESM，即 ES6 的模块语法 `import/export`

```shell
? Which framework does your project use? ...
  React
> Vue.js
  None of these
```

选择项目使用的框架，选择 Vue

```shell
? Does your project use TypeScript? » No / Yes
```

项目是否使用了 TypeScript，选择“是”

```shell
? Where does your code run? ...  (Press <space> to select, <a> to toggle all, <i> to invert selection)
√ Browser
  Node
```

选择项目运行的环境（多选），这里选择 `Browser` 即浏览器环境，这样会内置一些全局变量的检查，比如在使用 `window` 对象时，不会给出变量未定义的警告

```shell
? What format do you want your config file to be in? ...
> JavaScript
  YAML
  JSON
```

选项 ESLint 配置文件的格式，这里选择 JS 文件来配置

最后会提示需要安装一些包，确认并选择包管理器即可，安装完成后，生成 `.eslintrc.js`：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["vue", "@typescript-eslint"],
  rules: {},
};
```

对配置文件进行一个简单的解释：

- `env` 前文有提到过的项目运行环境，配置后在 ESLint 检查时会知道哪些是全局变量，而不会报 xx 变量未定义的错误（或警告）
- `extends`：当前配置文件继承某些配置文件
  - `eslint:recommended`：ESLint 推荐使用的配置。预设了[一些规则（绿色对钩高亮）](https://eslint.org/docs/latest/rules/)，如 [no-undef](https://eslint.org/docs/latest/rules/no-undef) 规则，该规则禁止使用未定义的变量
  - `plugin:vue/vue3-essential`：Vue 官方推荐的配置。预设了[一些规则](https://eslint.vuejs.org/rules/)，如 [vue/multi-word-component-names](https://eslint.vuejs.org/rules/multi-word-component-names.html)，该规则要求始终把组件名定义为多单词
  - `plugin:@typescript-eslint/recommended`：TypeScript 推荐（应该是社区推荐？）使用的配置。预设了[一些规则（绿色对钩高亮）](https://typescript-eslint.io/rules/)，如 [no-namespace](https://typescript-eslint.io/rules/no-namespace/)，该规则不允许使用命令空间关键字即 `namespace`
- `overrides`：可以更精细控制比如某一具体文件的规则来覆盖全局的规则
- `parser` 和 `parserOptions`：将代码转换为抽象语法树（AST）的解析器即对解析器的配置
- `plugins` 对 ESLint 进行扩展，如可自定义一些规则等，这里也可不需要填写，因在 `extends` 中继承的配置文件指定了插件
- `rules` 规则配置，在下文中会进行相对详细的介绍

事实上，上述的配置还并不能对 Vue SFC 文件进行检查，`.eslintrc.js` 配置中，`parser` 指定的是 TypeScript 相关的解析器，该解析器无法识别 Vue SFC 语法，可参考[官方提供的方法](https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser)来修改配置

安装 `vue-eslint-parser`，并修改 `.eslintrc.js` 如下：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  rules: {},
};
```

### rules

规则拥有三种严重的程度：

- `'off'` 或 `0` 不启用该规则的检查
- `'warn'` 或 `1` 不满足该规则即会抛出一个警告，但这不会退出程序
- `'error'` 或 `2` 不满足该规则即会抛出一个错误并退出程序

下面是一个例子：

> 需要注意的是，规则名称是需在配置文件中 `plugins` 中已实现的规则

```js
{
  rules: {
    // 关闭对变量未定义的检查
    'no-undef': 'off',
    // 使用单引号，否则将会抛出错误
    quotes: ['error', 'single'],
    // 代码尾部不使用（`never`，或使用 `always`）分号，否则将会抛出错误
    semi: ['error', 'never']
  }
}
```

### 配置注释

在代码编写时，有时为了实现某个功能写出可一个不满足某一规则的代码，为了通过检查可使用 ESLint 的配置注释来针对某一文件、某一行进行单独的配置

如对下一行禁用检查：

```ts

// eslint-disable-next-line no-console
console.log('hello')
```

[更多](https://eslint.org/docs/latest/use/configure/rules#disabling-rules)

### 使用

在 package.json 中配置 `script`：

```json
{
  "scripts": {
    "eslint": "eslint . --fix"
  }
}
```

其中 `.` 表示检查所有文件，也可指定具体的文件如 `eslint src/index.ts --fix`

`--fix` 参数表示强制修复（在规则可进行自动修复时候会强制修复，不可修复时候依然抛出警告或错误，如强制不使用分号，ESLint 可以删除分号），[这里](https://eslint.org/docs/latest/use/command-line-interface)可以查看更多选项

#### 与 Webpack 结合

上述的使用需要在手动运行命令来检查，一般的 Webpack 项目开发中，希望在编辑文件后实时进行检查反馈，这时需要使用到 [`eslint-webpack-plugin`](https://github.com/webpack-contrib/eslint-webpack-plugin)，修改 Webpack 配置：

```js
const ESLintPlugin = require('eslint-webpack-plugin')

module.export = {
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'ts', 'vue']
    })
  ]
}
```

需要注意的是 `eslint-webpack-plugin` 默认只会对 JS 文件进行检查，因此需要指定 `extensions` 字段

## Stylelint

TODO
