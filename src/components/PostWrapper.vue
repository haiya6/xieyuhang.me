<script setup lang="ts">
const props = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <component :is="frontmatter.container" v-if="frontmatter.container" v-bind="props">
    <slot />
  </component>
  <slot v-else />
</template>
