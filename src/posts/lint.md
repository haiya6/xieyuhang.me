---
container: Post
title: 在基于 Webpack 的 Vue 项目中启用代码语法规范校验
date: 2023/2/11
---

[[toc]]

## ESLint

[ESLint](https://eslint.org/) 是常用的对 **JS/TS** 代码的编写规范检查及修复工具

### 安装及配置

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

“如何使用 ESLint”，选择 `To check syntax and find problems`，检查语法并发现一些代码执行的潜在问题（如可能出现死循环等），这里的选择会影响到最终生成的配置文件内容，但如后面需要再调整也是非常容易的

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
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {},
}
```

对配置文件进行一个简单的解释：

- `env` 前文有提到过的项目运行环境，配置后在 ESLint 检查时会知道哪些是全局变量，而不会报 xx 变量未定义的错误（或警告）
- `extends` 当前配置文件继承某些配置文件
  - `eslint:recommended` ESLint 推荐使用的配置。预设了[一些规则（绿色对钩高亮）](https://eslint.org/docs/latest/rules/)，如 [no-undef](https://eslint.org/docs/latest/rules/no-undef) 规则，该规则禁止使用未定义的变量
  - `plugin:vue/vue3-essential`：Vue 官方推荐的配置。预设了[一些规则](https://eslint.vuejs.org/rules/)，如 [vue/multi-word-component-names](https://eslint.vuejs.org/rules/multi-word-component-names.html)，该规则要求始终把组件名定义为多单词
  - `plugin:@typescript-eslint/recommended` TypeScript 推荐（应该是社区推荐？）使用的配置。预设了[一些规则（绿色对钩高亮）](https://typescript-eslint.io/rules/)，如 [no-namespace](https://typescript-eslint.io/rules/no-namespace/)，该规则不允许使用命令空间关键字即 `namespace`
- `overrides` 可以更精细控制比如某一具体文件的规则来覆盖全局的规则
- `parser` 和 `parserOptions`：将代码转换为抽象语法树（AST）的解析器即对解析器的配置
- `plugins` 对 ESLint 进行扩展，如可自定义一些规则等，这里也可不需要填写，因在 `extends` 中继承的配置文件指定了插件
- `rules` 规则配置，在下文中会进行相对详细的介绍

事实上，上述的配置还并不能对 Vue SFC 文件进行检查，`.eslintrc.js` 配置中，`parser` 指定的是 TypeScript 相关的解析器，该解析器无法识别 Vue SFC 语法，可参考[Vue 官方提供的方法](https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser)来修改配置

安装 `vue-eslint-parser`，并修改 `.eslintrc.js` 如下：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {},
}
```

对 rules 进行一些解释，rule 拥有三种严重的程度：

- `'off'` 或 `0` 不启用该规则的检查
- `'warn'` 或 `1` 不满足该规则即会抛出一个警告，但这不会退出程序
- `'error'` 或 `2` 不满足该规则即会抛出一个错误并退出程序

下面是一个例子：

> 需要注意的是，规则名称是需在配置文件中 `plugins` 中已实现的规则

```js
module.exports = {
  rules: {
    // 关闭对变量未定义的检查
    'no-undef': 'off',
    // 使用单引号，否则将会抛出错误
    'quotes': ['error', 'single'],
    // 代码尾部不使用（`never`，或使用 `always`）分号，否则将会抛出错误
    'semi': ['error', 'never']
  }
}
```

### 配置注释

在代码编写时，有时为了实现某个功能写出可一个不满足某一规则的代码，为了通过检查可使用 ESLint 的配置注释来针对某一文件、某一行进行单独的配置

如对下一行禁用检查：

```ts
console.log('hello')
```

[更多注释在这里查看](https://eslint.org/docs/latest/use/configure/rules#disabling-rules)

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

`--fix` 参数表示自动修复（在规则可进行自动修复时候会自动修复，不可修复时候依然抛出警告或错误，如强制不使用分号，ESLint 可以删除分号），[这里可以查看更多选项](https://eslint.org/docs/latest/use/command-line-interface)

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

[Stylelint](https://stylelint.io/) 是常用的对 CSS/SCSS 进行编写规范检查及修复工具

### 安装及配置

```shell
# `stylelint-config-recommended` 是 Stylelint 官方推荐的配置
pnpm i stylelint stylelint-config-recommended -D
```

默认下 Stylelint 支持对 CSS 文件检查，但在项目开发中还会涉及到对 Vue、HTML 以及 SCSS 文件检查，因此还需安装下列第三方包

+ 处理 Vue、HTML 文件：

  ```shell
  pnpm i postcss-html -D
  ```

+ 处理 SCSS 文件：

  ```shell
  pnpm i postcss-scss -D
  ```

新建 `.stylelintrc.js` 配置 Stylelint：

```js
module.exports = {
  extends: [
    'stylelint-config-recommended'
  ],
  overrides: [
    {
      files: ['**/*.{html,vue}'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss'
    }
  ],
  rules: {}
}
```

对配置文件进行一个简单的解释：

+ `extends` 继承某些配置文件
+ `overrides` 因 Stylelint 默认只支持对 CSS 文件的检查，因此这里需要对部分文件应用的配置进行重写，当处理 HTML 和 Vue 文件时，使用 `postcss-html` 语法解析器，解析出里面的 `<style></style>` 标签内容；当处理 CSS 和 SCSS 文件时，使用 `postcss-scss` 语法解析器
+ `rules` 与 ESLint 类似，可以对已实现的规则进行配置，在本文中安装的 Stylelint 官方提供的 `stylelint-config-recommended`，[可以在这里浏览规则](https://stylelint.io/user-guide/rules)

### 配置注释

与 ESLint 类似，Stylelint 也支持通过配置注释对部分代码进行检查规则的调整，[这里查看更多内容](https://stylelint.io/user-guide/ignore-code)

### 使用

在 package.json 中配置 `script`：

```json
{
  "scripts": {
    "stylelint": "stylelint \"**/*.{vue,scss,html,css}\" --fix"
  }
}
```

`stylelint` 命令后接需要检查的文件，`--fix` 参数表示在某些不满足规则代码可自动修复前提下进行自动的修复，[更多选项在这里查看](https://stylelint.io/user-guide/cli)

#### 与 Webpack 结合

上述的使用需要在手动运行命令来检查，一般的 Webpack 项目开发中，希望在编辑文件后实时进行检查反馈，这时需要使用到 `stylelint-webpack-plugin`，修改 Webpack 配置：

```js
const StylelintPlugin = require('stylelint-webpack-plugin')

module.export = {
  plugins: [
    new StylelintPlugin({
      extensions: ['css', 'scss', 'vue', 'html']
    })
  ]
}
```

需要注意的是 `stylelint-webpack-plugin` 默认只会对 CSS/SCSS 文件进行检查，因此需要指定 `extensions` 字段

## Prettier

[Prettier](https://prettier.io/) 是一个代码格式化工具，与上文提到的 ESLint 和 Stylelint 不同的是 Prettier 不会进行语法规范检查

如在 ESLint 中内置规则 [no-var](https://eslint.org/docs/latest/rules/no-var) 会要求使用 `let` 和 `const` 关键字来替代 `var` 关键字，而 Prettier 不会做任何要求只专注于代码的格式化

Prettier 对很多常用文件类型内置了支持，如 HTML、JS、TS、CSS、Vue、SCSS 文件等

### 安装及配置

```shell
pnpm i prettier -D
```

新建 Prettier 配置文件 `.prettierrc.js`

```js
module.exports = {
  // 不使用分号
  semi: false
}
```

上述配置文件配置了 `semi: false` 表示不使用分号，[更多的配置项在这里查看](https://prettier.io/docs/en/options.html)

### 使用

在 package.json 中配置 `script`：

```json
{
  "scripts": {
    "prettier": "prettier . --write"
  }
}
```

`prettier` 命令后接需要检查的文件，`--write` 表示格式化覆写文件，还有一个类似的选项是 `--check`，但该选项只会对文件进行未格式化的检查，而不是修改文件

若使用 VSCode 编辑器，也可安装 [Prettier 扩展](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)即可在文件中右键使用 Prettier 提供的格式化功能

## Githooks

[Githooks](https://git-scm.com/docs/githooks) 是 git 在执行某些命令之前会执行对应预设的 hook 文件，这些 hooks 默认存放在项目的 `.git/hooks` 目录中，也可以通过 `git config core.hooksPath my-hooks/` 命令来修改为项目根目录中的 `my-hooks` 目录

> 打开 `.git/hooks` 可以看到很多 `.sample` 后缀文件，这些文件是 hook 的模板或介绍文件，而删除 `.sample` 后缀才是真正会生效的 hook

### 体验

在 `.git/hooks`（未修改 `hooksPath` 时） 中新建 `pre-commit` 文件（或从 `pre-commit.sample` 文件重命名），此 hook 会在执行 `git commit -m 'xxx'` 命令执行时执行，编辑 `pre-commit` 文件

```shell
#!/bin/sh

echo "Hello Githooks"
```

执行 `git commit -m 'xxx'` （暂存区内有文件时），可以看到控制台有 “Hello Githooks” 输出，因此在项目开发中，可以利用此 hook 来对提交的文件进行校验，如遇不满足规范的情况可以阻止提交，另外还有 `commit-msg` hook 可做到对提交的信息（-m '...'）来进行校验，同样若不满足规范时可阻止提交

### husky

上述配置 Githooks 的方法有一个缺陷，在本地配置好之后不会提交到远程仓库，因此不能做到团队共享，解决这个问题可以使用社区提供的第三方库 [husky](https://typicode.github.io/husky) （当然 husky 不只这么一点特性）

#### 安装

```shell
pnpm i husky -D
```

#### 启用

```shell
npx husky install
```

运行此命令后会在项目根目录生成 `.husky` 目录，**同时会将 git 的 hooks 目录设置为 `.husky` 目录**，这是团队成员共享 Githooks 的重要之处

因此，需要将该命令添加进 `postinstall` npm hook 中（该 npm hook 会在执行 `npm install` 之后执行）

package.json

```json
{
  "scripts": {
    "postinstall": "husky install"
  }
}
```

### commitlint

[commitlint](https://commitlint.js.org) 是社区常用的 git 提交信息规范检查工具

#### 安装

```shell
pnpm install @commitlint/config-conventional @commitlint/cli -D
```

新建配置文件 `.commitlintrc.js`

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

通过 husky 添加 `commit-msg` hook

```shell
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

最后尝试通过 git 创建一个提交即可体验，当提交的信息不满足规范时会被拒绝提交成功

### lint-staged

[lint-staged](https://github.com/okonet/lint-staged) 是可以对 git **暂存区**的文件运行一些命令，如在 git 提交之前对提交的文件进行 ESLint、Stylelint、Prettier 检查

#### 安装

```shell
pnpm i lint-staged -D
```

在 package.json 中增加配置

> 也可以新建 `.lintstagedrc.js` 文件进行配置

```json
{
  "lint-staged": {
    "*": "prettier --write",
    "*.{js,ts,vue}": "eslint --fix",
    "*.{css,scss,vue}": "stylelint --fix"
  }
}
```

通过 husky 添加 `pre-commit` hook

```shell
npx husky add .husky/commit-msg  'npx lint-staged'
```

上述配置中，当进行一次 git 提交时，**暂存区**内的任意文件都会被 Prettier 格式化，JS/TS/Vue 被 ESLint 检查，CSS/SCSS/VUE 被 Stylelint 检查

需要注意的是，JS/TS/VUE 会同时被 Prettier 和 ESLint 检查，ESLint 虽然是语法检查的工具，但内部也有一些规则如 [`max-len`](https://eslint.org/docs/latest/rules/max-len) 和 Prettier 提供的 [Print Width](https://prettier.io/docs/en/options.html#print-width) 冲突，他们都是限制一行的文字最大字符数，解决这一问题可以使用 Prettier 提供的 [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) 配置，该配置是 ESLint 配置，配置中**关闭**了一些与 Prettier 冲突的规则

```shell
pnpm i eslint-config-prettier -D
```

```diff
// .eslintrc.js

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
+   'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  },
  overrides: [
    {
      files: ['.eslintrc.js', 'prettier.config.js', '.stylelintrc.js', '.commitlintrc.js'],
      env: {
        node: true
      }
    }
  ]
}
```
