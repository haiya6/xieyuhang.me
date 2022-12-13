<script setup lang="ts">
import { formatDate } from '@/logic'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  }
})
</script>

<template>
  <article class="post">
    <h1 v-if="frontmatter.title">{{ frontmatter.title }}</h1>
    <p v-if="frontmatter.date" class="date">{{ formatDate(frontmatter.date) }}</p>
    <slot />
  </article>
</template>

<style lang="scss" scoped>
article {
  .date {
    opacity: 0.5;
    margin-top: -0.5rem;
  }
}
</style>
