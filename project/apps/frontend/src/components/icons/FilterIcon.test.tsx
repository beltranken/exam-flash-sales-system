import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FilterIcon from './FilterIcon'

describe('FilterIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<FilterIcon />)

    expect(markup).toContain('<svg')
  })
})
