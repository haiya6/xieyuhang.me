<script setup lang="ts">
import BackIcon from '@/assets/imgs/ic_back.svg?component'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>

<template>
  <footer class="app-footer">
    <a v-if="!isHomePage" class="btn-back" @click="$router.go(-1)">
      <BackIcon class="icon-back" />
      <span>. .</span>
    </a>
    <p class="license">
      CC BY-NC-SA 4.0 2021 谢宇航
    </p>
    <a class="registration-no" href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2022020453号-1</a>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  padding: 2rem 0;
  color: var(--color);

  .btn-back {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 2rem;
    opacity: 0.7;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    .icon-back {
      width: 18px;
      height: 18px;
    }
  }

  .license {
    margin-top: 2rem;
    opacity: 0.7;
  }

  .registration-no {
    display: inline-block;
    margin-top: 0.5rem;
    opacity: 0.7;
  }
}
</style>
