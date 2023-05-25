<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/logic'

interface Post {
  title: string
  date: string
  to: string
}

const { number } = defineProps({
  number: {
    type: Number,
  },
})
const posts = ref<Post[]>([])
const router = useRouter()

posts.value = router
  .getRoutes()
  .filter(route => route.path.startsWith('/posts/'))
  .map((route) => {
    const { path, meta } = route
    const { title, date } = meta.frontmatter as any
    return {
      title,
      date,
      to: path,
    }
  })
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  .slice(0, number)
</script>

<template>
  <ul class="post-list-comp">
    <li v-for="(item, index) in posts" :key="index" class="item">
      <RouterLink :to="item.to">
        {{ item.title }}
        <span class="date">{{ formatDate(item.date) }}</span>
      </RouterLink>
    </li>
  </ul>
</template>

<style lang="scss">
.post-list-comp {
  .item {
    & + .item {
      margin-top: 1rem;
    }
    .date {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-left: 1rem;
    }
  }
}
</style>
