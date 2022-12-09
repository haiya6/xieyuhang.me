<script setup lang="ts">
const props = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  }
})
</script>

<template>
  <component v-if="frontmatter.container" :is="frontmatter.container" v-bind="props">
    <slot />
  </component>
  <slot v-else />
</template>
