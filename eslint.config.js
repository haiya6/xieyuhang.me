// @ts-check
import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    vue: true,
    typescript: true,
    rules: {},
  },
  {
    ignores: [
      'public/**/*',
    ],
  },
)
