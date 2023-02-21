import { App } from 'vue'
import { useDark } from '@vueuse/core'
import dayjs from 'dayjs'
import a11yLight from 'highlight.js/styles/a11y-light.css?raw'
import a11yDark from 'highlight.js/styles/a11y-dark.css?raw'

export const $ = window.document.querySelector.bind(window.document)

export const registerComponents = (app: App<Element>) => {
  const modules = import.meta.glob(['@/components/*.vue', '@/posts/**/*.vue'], {
    eager: true
  })
  Object.entries(modules).forEach(([name, component]) => {
    app.component(name.split('/').at(-1)!.replace(/\..+$/, ''), (component as any).default)
  })
}

export const isDark = useDark({
  onChanged(dark) {
    if (dark) $('html')!.classList.add('dark')
    else $('html')!.classList.remove('dark')

    $('#highlight-style')!.textContent = dark ? a11yDark : a11yLight
  }
})

export const formatDate = (date: string) => {
  const d = dayjs(date)
  if (d.isSame(new Date(), 'year')) {
    return d.format('MM-DD')
  }
  return d.format('YYYY-MM-DD')
}
