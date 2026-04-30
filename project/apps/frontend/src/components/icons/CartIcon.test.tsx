import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CartIcon from './CartIcon'

describe('CartIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<CartIcon />)

    expect(markup).toContain('<svg')
  })
})
