import { resolve } from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import matter from 'gray-matter'
import hljs from 'highlight.js'
import SVG from 'vite-svg-loader'
import LinkAttributes from 'markdown-it-link-attributes'
import hljsDefineVue from './plugins/hljs/vue'
import TOC from 'markdown-it-table-of-contents'
import anchor from 'markdown-it-anchor'

hljs.registerLanguage('vue', hljsDefineVue)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/]
    }),
    Pages({
      dirs: [{ dir: 'src/posts', baseRoute: 'posts' }],
      extensions: ['vue', 'md'],
      exclude: [],
      extendRoute(route) {
        const md = fs.readFileSync(resolve(__dirname, route.component.slice(1)), 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        return route
      }
    }),
    Markdown({
      wrapperComponent: 'Container',
      markdownItOptions: {
        quotes: '""\'\'',
        linkify: false,
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
      },
      markdownItSetup(md) {
        md.use(LinkAttributes, {
          attrs: {
            target: '_blank',
            rel: 'noopener'
          }
        })
        md.use(TOC, {
          includeLevel: [1, 2, 3]
        })
        md.use(anchor)
      }
    }),
    SVG()
  ]
})
