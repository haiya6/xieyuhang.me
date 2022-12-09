<script setup lang="ts">
import { isDark } from '@/logic'

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <nav class="nav">
    <RouterLink to="/" title="回到首页">
      <img class="icon-home" src="@/assets/home.svg">
    </RouterLink>
    <div class="right">
      <RouterLink class="item" to="/" title="Blog">Blog</RouterLink>
      <a class="item" target="_blank" title="GitHub" href="https://github.com/haiya6">GitHub</a>
      <a class="item" target="_blank" title="稀土掘金" href="https://juejin.cn/user/4230576474700023">掘金</a>
      <a class="item toggle-theme" title="切换配色方案" @click="toggleDark">
        <img v-show="isDark" class="icon" src="@/assets/dark.svg">
        <img v-show="!isDark" class="icon" src="@/assets/light.svg">
      </a>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.nav {
  width: 100%;
  padding: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0.7;
  
  img {
    opacity: 0.5;
  }
  
  .icon-home {
    width: 18px;
    height: 18px;
    color: inherit;
  }
  
  .right {
    display: flex;
    align-items: center;
    
    .item {
      cursor: pointer;

      & +.item {
        margin-left: 18px;
      }

      &.toggle-theme {
        .icon {
          width: 18px;
          height: 18px;
          color: inherit;
        }
      }
    }
  }
}
</style>
