import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ImageIcon from './ImageIcon'

describe('ImageIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<ImageIcon />)

    expect(markup).toContain('<svg')
  })
})
