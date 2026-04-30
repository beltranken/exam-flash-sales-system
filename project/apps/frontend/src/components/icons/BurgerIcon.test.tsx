import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BurgerIcon from './BurgerIcon'

describe('BurgerIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<BurgerIcon />)

    expect(markup).toContain('<svg')
  })
})
