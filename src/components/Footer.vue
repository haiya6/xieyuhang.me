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
    <p class="copyright">Copyright 2022 by Xieyuhang.</p>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  opacity: 0.6;
  padding: 2rem 0;
  color: var(--color);

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

  .copyright {
    font-size: 0.875rem;
  }
}
</style>
