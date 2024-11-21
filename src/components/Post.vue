<script setup lang="ts">
import { formatDate } from '@/logic'

const props = defineProps<{
  frontmatter?: {
    title?: string
    date?: string
  }
}>()
</script>

<template>
  <article class="post">
    <h1 v-if="props.frontmatter?.title">
      {{ props.frontmatter.title }}
    </h1>
    <p v-if="props.frontmatter?.date" class="date">
      {{ formatDate(props.frontmatter.date) }}
    </p>
    <slot />
  </article>
</template>

<style lang="scss" scoped>
article {
  .date {
    opacity: 0.7;
    margin-top: -0.5rem;
  }
}
</style>
