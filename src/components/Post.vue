<script setup lang="ts">
const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  }
})
</script>

<template>
  <main>
    <div class="post">
      <h1>{{ frontmatter.title }}</h1>
      <p class="date">2022.12.10</p>
    </div>
    <article>
      <slot />
    </article>
  </main>
</template>

<style lang="scss" scoped>
main {
  padding: 2rem;

  .date {
    opacity: 0.5;
    margin-top: -0.5rem;
  }
}
</style>
