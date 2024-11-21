import fs from 'node:fs'
import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import matter from 'gray-matter'
import hljs from 'highlight.js'
import anchor from 'markdown-it-anchor'
import LinkAttributes from 'markdown-it-link-attributes'
import TOC from 'markdown-it-table-of-contents'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import SVG from 'vite-svg-loader'
import hljsDefineVue from './plugins/hljs/vue'

hljs.registerLanguage('vue', hljsDefineVue)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Pages({
      dirs: [{ dir: 'src/posts', baseRoute: 'posts' }],
      extensions: ['md'],
      exclude: [],
      extendRoute(route) {
        const md = fs.readFileSync(resolve(__dirname, route.component.slice(1)), 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        return route
      },
    }),
    Markdown({
      wrapperComponent: 'PostWrapper',
      markdownItOptions: {
        quotes: '""\'\'',
        linkify: false,
        highlight(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang }).value
            }
            catch {
              // nothing
            }
          }
          return ''
        },
      },
      markdownItSetup(md) {
        md.use(LinkAttributes, {
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
        md.use(TOC, {
          includeLevel: [1, 2, 3],
        })
        // @ts-expect-error unknown
        md.use(anchor)
      },
    }),
    SVG(),
  ],
})
