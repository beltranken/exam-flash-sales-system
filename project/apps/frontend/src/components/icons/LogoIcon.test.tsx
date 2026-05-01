import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LogoIcon from './LogoIcon'

describe('LogoIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<LogoIcon />)

    expect(markup).toContain('<svg')
  })
})
