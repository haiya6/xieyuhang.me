import { useDark } from '@vueuse/core'

import a11yLight from 'highlight.js/styles/a11y-light.css?raw'
import a11yDark from 'highlight.js/styles/a11y-dark.css?raw'

export const isDark = useDark({
  onChanged(dark) {
    window.document.querySelector('#highlight-style')!.textContent =
      dark ? a11yDark : a11yLight
  }
})
