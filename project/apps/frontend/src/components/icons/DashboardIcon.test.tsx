import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DashboardIcon from './DashboardIcon'

describe('DashboardIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<DashboardIcon />)

    expect(markup).toContain('<svg')
  })
})
