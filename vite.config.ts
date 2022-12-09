import { resolve } from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import matter from 'gray-matter'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Pages({
      dirs: [
        { dir: 'src/posts', baseRoute: 'posts' }
      ],
      extensions: ['vue', 'md'],
      exclude: [],
      extendRoute(route, parent) {
        const md = fs.readFileSync(resolve(__dirname, route.component.slice(1)), 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        return route
      },
    }),
    Markdown()
  ]
})
