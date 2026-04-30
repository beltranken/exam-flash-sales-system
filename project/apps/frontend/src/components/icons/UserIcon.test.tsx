import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import UserIcon from './UserIcon'

describe('UserIcon', () => {
  it('renders an svg element', () => {
    const markup = renderToStaticMarkup(<UserIcon />)

    expect(markup).toContain('<svg')
  })
})
