<script setup lang="ts">
import { ref, StyleValue } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/logic'

interface Post {
  title: string
  date: string
  to: string
}

const { number } = defineProps({
  number: {
    type: Number
  }
})
const posts = ref<Post[]>([])
const dateStyle: StyleValue = {
  fontSize: '0.9rem',
  opacity: '0.8',
  marginLeft: '1rem'
}
const router = useRouter()

posts.value = router.getRoutes()
  .filter(route => route.path.startsWith('/posts/'))
  .map(route => {
    const { path, meta } = route
    const { title, date } = meta.frontmatter as any
    return {
      title,
      date,
      to: path
    }
  })
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .slice(0, number)
</script>

<template>
  <ul>
    <li v-for="(item, index) in posts" :key="index">
      <RouterLink :to="item.to">
        {{ item.title }}
        <span :style="dateStyle">{{ formatDate(item.date) }}</span>
      </RouterLink>
    </li>
  </ul>
</template>
