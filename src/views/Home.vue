<script setup lang="ts">
import PostList from './PostList.vue'
</script>

<template>
  <Post>
    <h1>你好</h1>
    <p>谢宇航，是一名前端开发工程师，源码熟悉前端框架 Vue、React，爱好和擅长前端基建开发</p>
    <p>联系我 <code>xieyhn@gmail.com</code></p>
    <p><b>我的开源项目：</b></p>
    <ul>
      <li>
        <a href="https://github.com/xieyhn/vite-plugin-lottie" target="_blank">
          vite-plugin-lottie，是一个 Vite 插件，用于在 Vite 项目中导入 Lottie 资源
        </a>
      </li>
      <li>
        <a href="https://github.com/xieyhn/weapp-scroll" target="_blank">
          weapp-scroll，是一个微信小程序滚动插件，利用 WXS 编写，为统一 iOS 和 Android 的滚动体验
        </a>
      </li>
      <li>
        <a href="https://github.com/xieyhn/vue-presetup" target="_blank">
          vue-presetup，基于 Vue3，将组件进行预加载，便于优化页面切换体验
        </a>
      </li>
      <li>
        <a href="https://github.com/xieyhn/vite-plugin-html-resolve-alias" target="_blank">
          vite-plugin-html-resolve-alias，是一个 Vite 插件，可以在 HTML 中使用 alias 配置
        </a>
      </li>
      <li>
        <a href="https://github.com/xieyhn/vite-plugin-legacy-dev" target="_blank">
          vite-plugin-legacy-dev，是一个 Vite 插件，用于开发环境兼容旧版本浏览器
        </a>
      </li>
    </ul>
    <p>另外擅长特效、响应式开发，这里有一些案例（均能访问，但可能需要等待加载）：</p>
    <ul>
      <li>
        <a href="https://works.xieyuhang.me/jiuzhou-plus/" target="_blank">九州商务官方网站</a>
      </li>
      <li>
        <a href="https://works.xieyuhang.me/yzy/" target="_blank">武汉友芝友医疗科技官方网站</a>
      </li>
      <li>
        <a href="https://works.xieyuhang.me/wenjinshuyuan/" target="_blank">湖北省重点景区问津书院官方网站</a>
      </li>
      <li>
        <a href="https://works.xieyuhang.me/screen-a/" target="_blank">可视化大屏 A</a>
      </li>
      <li>
        <a href="https://works.xieyuhang.me/screen-b/" target="_blank">可视化大屏 B</a>
      </li>
    </ul>
    <h2>文章</h2>
    <PostList />
  </Post>
</template>

<style lang="scss" scoped></style>
