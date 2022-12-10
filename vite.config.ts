import { resolve } from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import matter from 'gray-matter'
import hljs from 'highlight.js'
import SVG from 'vite-svg-loader'
import hljsDefineVue from './hljs/vue'

hljs.registerLanguage('vue', hljsDefineVue)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
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
      extendRoute(route) {
        const md = fs.readFileSync(resolve(__dirname, route.component.slice(1)), 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        return route
      },
    }),
    Markdown({
      wrapperComponent: 'Container',
      markdownItOptions: {
        quotes: '""\'\'',
        highlight(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang }).value
            } catch {
              // nothing
            }
          }
          return ''
        }
      }
    }),
    SVG()
  ]
})
