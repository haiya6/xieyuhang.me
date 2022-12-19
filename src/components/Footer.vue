<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import BackIcon from '@/assets/back.svg?component'

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
    <p class="license">CC BY-NC-SA 4.0 2021 © xieyuhang</p>
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
