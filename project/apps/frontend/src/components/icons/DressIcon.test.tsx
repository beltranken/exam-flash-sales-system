import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DressIcon from './DressIcon'

describe('DressIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<DressIcon />)

    expect(markup).toContain('<svg')
  })
})
