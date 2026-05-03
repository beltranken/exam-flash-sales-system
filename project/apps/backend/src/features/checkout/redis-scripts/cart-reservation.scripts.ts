import { readFileSync } from 'node:fs'

const readLuaScript = (filename: string) => readFileSync(new URL(filename, import.meta.url), 'utf8')

export const reserveCartScript = readLuaScript('./reserve-cart.lua')
export const rollbackCartReservationsScript = readLuaScript('./rollback-cart-reservations.lua')
