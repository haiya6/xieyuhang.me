<script setup lang="ts">
import { isDark } from '@/logic'
import HomeIcon from '@/assets/home.svg?component'
import DarkIcon from '@/assets/dark.svg?component'
import LightIcon from '@/assets/light.svg?component'

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <nav class="nav">
    <RouterLink class="btn-home" to="/" title="回到首页">
      <HomeIcon class="icon-home" />
    </RouterLink>
    <div class="right">
      <a class="item" target="_blank" title="GitHub" href="https://github.com/xieyhn">GitHub</a>
      <!-- <a class="item" target="_blank" title="稀土掘金" href="https://juejin.cn/user/4230576474700023">掘金</a> -->
      <a class="item toggle-theme" title="切换配色方案" @click="toggleDark">
        <DarkIcon v-show="isDark" class="icon" />
        <LightIcon v-show="!isDark" class="icon" />
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
  color: var(--color);

  img {
    opacity: 0.5;
  }

  .btn-home {
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-home {
      width: 18px;
      height: 18px;
    }
  }

  .right {
    display: flex;
    align-items: center;

    .item {
      cursor: pointer;

      & + .item {
        margin-left: 18px;
      }

      &.toggle-theme {
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
          width: 18px;
          height: 18px;
        }
      }
    }
  }
}
</style>
