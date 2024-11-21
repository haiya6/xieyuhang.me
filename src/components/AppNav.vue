<script setup lang="ts">
import DarkIcon from '@/assets/imgs/ic_dark.svg?component'
import HomeIcon from '@/assets/imgs/ic_home.svg?component'
import LightIcon from '@/assets/imgs/ic_light.svg?component'
import { isDark } from '@/logic'
import { useToggle } from '@vueuse/core'

const toggleDark = useToggle(isDark)
</script>

<template>
  <nav class="nav">
    <div class="nav-links">
      <RouterLink class="nav-link" to="/" title="Home">
        <HomeIcon class="nav-icon" />
      </RouterLink>
    </div>
    <div class="nav-links">
      <a class="nav-link" target="_blank" title="GitHub" href="https://github.com/xieyhn">GitHub</a>
      <a class="nav-link" title="Toggle Theme" @click="toggleDark()">
        <DarkIcon v-show="isDark" class="nav-icon" />
        <LightIcon v-show="!isDark" class="nav-icon" />
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

  .nav-icon {
    width: 18px;
    height: 18px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 18px;

    .nav-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      opacity: 0.7;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
