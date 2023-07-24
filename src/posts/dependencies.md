---
container: Post
title: dependencies(package.json)
date: 2023/7/24
---

版本号一般由三个部分组成，分别是 `major`、`minor` 和 `patch`，如 `1.2.3`，其中 `1` 是 `major`，`2` 是 `minor`，`3` 是 `patch`。

+ `version` 用来精确匹配的具体版本号，如 `1.2.3`。
+ `>version` 大于某个版本号，如 `>1.2.3`。
+ `>=version` 大于等于某个版本号，如 `>=1.2.3`。
+ `<version` 小于某个版本号，如 `<1.2.3`。
+ `<=version` 小于等于某个版本号，如 `<=1.2.3`。
+ `~version` 大于等于某个版本号，但是只要 `minor` 版本号相同，如 `~1.2.3`，则可以匹配 `1.2.4`、`1.2.5` 等。
+ `^version` 大于等于某个版本号，但是只要 `major` 版本号相同，如 `^1.2.3`，则可以匹配 `1.3.0`、`1.4.0` 等。
+ `1.2.x` 等同于 `~1.2.0`，`1.x` 等同于 `~1.0.0`。
+ `*`、`''`（空字符） 匹配任意版本。
+ `version1 - version2` 等同于 `>=version1 <=version2`，如 `1.2.3 - 2.3.4` 等同于 `>=1.2.3 <=2.3.4`。
+ `range1 || range2` 匹配 `range1` 或 `range2`，如 `>=1.2.3 || <2.0.0`。
+ `git...` Git 仓库下载，形式： `<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]`，如 `git://github.com/user/project.git#commit-ish`。
+ `user/repo` Github 仓库的简写，`user`：用户，`repo`：仓库名，如 `user/repo` 等同于 `git://github.com/user/repo.git`，也可以带上 commit-ish 或 semver 信息。
+ `path/path/path` 本地磁盘路径，如 `file:../foo/bar`（bar 是一个有 package.json 文件的目录）。
