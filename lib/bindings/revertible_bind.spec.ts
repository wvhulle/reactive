import { Writable_Stream } from '../primitive/writable.js'
import { Revertible_Bind } from './revertible_bind.js'

import { expect, it } from 'vitest'

it('modified', () => {
    const w = new Writable_Stream<'OFF' | 'ON'>('ON')
    const b = new Revertible_Bind<'OFF' | 'ON', boolean>(
        w,
        v => (v === 'OFF' ? false : true),
        v => (v ? 'ON' : 'OFF')
    )

    expect(w.get()).toBe('ON')
    expect(b.get()).toBe(true)
    expect(b.modified.get()).toBe(false)
    w.set('OFF')
    expect(b.get()).toBe(false)

    expect(b.modified.get()).toBe(true)
})
