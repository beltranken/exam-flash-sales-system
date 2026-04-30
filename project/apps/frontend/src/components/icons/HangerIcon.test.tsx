import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import HangerIcon from './HangerIcon'

describe('HangerIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<HangerIcon />)

    expect(markup).toContain('<svg')
  })
})
