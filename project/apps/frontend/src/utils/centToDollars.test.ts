import { describe, expect, it } from 'vitest'
import { centToDollars } from './centToDollars'

describe('centToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centToDollars(12345)).toBe(123.45)
  })

  it('returns zero for zero cents', () => {
    expect(centToDollars(0)).toBe(0)
  })

  it('preserves fractional dollar values', () => {
    expect(centToDollars(99)).toBe(0.99)
  })
})
