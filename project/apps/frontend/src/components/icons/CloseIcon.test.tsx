import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CloseIcon from './CloseIcon'

describe('CloseIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<CloseIcon />)

    expect(markup).toContain('<svg')
  })
})
