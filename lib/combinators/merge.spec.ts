import { Writable_Stream } from '../primitive/writable.js'
import { Merge_Map } from './merge.js'

import { expect, it } from 'vitest'

it('merge', () => {
    const A = new Writable_Stream<number>(0)
    const B = new Writable_Stream<number>(0)
    const m = new Merge_Map([A, B], (a, b) => a === b)
    // expect(reactive.initial.ready);
    expect(m.get()).toBe(true)
    A.set(1)
    expect(m.get()).toBe(false)
    // expect(reactive.initial.now()).toBe(0);
})
