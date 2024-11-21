<script setup lang="ts">
import BackIcon from '@/assets/back.svg?component'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const backVisible = ref(false)
const route = useRoute()

watchEffect(() => {
  backVisible.value = route.path !== '/'
})
</script>

<template>
  <footer class="footer">
    <a v-if="backVisible" class="back" @click="$router.go(-1)">
      <BackIcon class="icon-back" />
      <span>. .</span>
    </a>
    <p class="license">
      CC BY-NC-SA 4.0 2021 © xieyuhang
    </p>
    <a class="case-number" href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2022020453号-1</a>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  opacity: 0.6;
  padding: 2rem 0;
  color: var(--color);

  .license {
    margin-top: 2rem;
  }

  .case-number {
    display: inline-block;
    margin-top: 0.5rem;
  }

  .back {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 2rem;

    .icon-back {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
