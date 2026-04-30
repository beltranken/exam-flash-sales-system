import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import HeartIcon from './HeartIcon'

describe('HeartIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<HeartIcon />)

    expect(markup).toContain('<svg')
  })
})
