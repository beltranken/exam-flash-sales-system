import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FireIcon from './FireIcon'

describe('FireIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<FireIcon />)

    expect(markup).toContain('<svg')
  })
})
