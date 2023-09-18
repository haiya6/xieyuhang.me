---
container: Post
title: npm 小笔记
date: 2023/09/18
---

+ 在 npm7+ 给脚本传递参数时，需要使用 `--` 来分割参数和脚本，否则会被当做脚本的参数传递进去
+ npm6 的 package.lock 功能对使用**别名**的包支持不好，并不会锁定别名包的版本：
  ```json
  {
    "dependencies": {
      "lodash": "npm:lodash-es@^4.17.21"
    }
  }
  ```
  这样的配置，即使存在 lock 文件对 lodash 进行了版本锁定，但重新安装时，依然不会按照锁定的版本安装，而是 `^4.17.21` 的最新版本。