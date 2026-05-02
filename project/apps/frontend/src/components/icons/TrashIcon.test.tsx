import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BagIcon from './BagIcon'

describe('BagIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<BagIcon />)

    expect(markup).toContain('<svg')
  })
})
