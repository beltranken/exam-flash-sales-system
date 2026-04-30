import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import JacketIcon from './JacketIcon'

describe('JacketIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<JacketIcon />)

    expect(markup).toContain('<svg')
  })
})
