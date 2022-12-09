<script setup lang="ts">
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
      <img class="icon-back" src="@/assets/back.svg">
      <span>. .</span>
    </a>
    <p class="copyright">Copyright 2022 by Xieyuhang.</p>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  opacity: 0.6;
  padding: 2rem 0;

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
