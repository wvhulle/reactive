import { Readable_Stream } from '../primitive/readable.js'
import { Writable_Stream } from '../primitive/writable.js'
import { Deep_Filter } from './deep_filter.js'

import { expect, it } from 'vitest'

it('one element', () => {
    const list = new Readable_Stream([new Readable_Stream(true), new Readable_Stream(false)])

    const filter = new Deep_Filter(list, v => v)
    expect(filter.get()).to.have.length(1)
})

it('toggling an element', () => {
    const toggle = new Writable_Stream(false)
    const list = new Readable_Stream([new Readable_Stream(true), toggle])

    const filter = new Deep_Filter(list, v => v)
    expect(filter.get()).to.have.length(1)
    toggle.set(true)
    expect(filter.get()).to.have.length(2)
})

it('changing length', () => {
    const A = { value: new Writable_Stream({ visible: false }) }
    const B = { value: new Writable_Stream({ visible: true }) }

    const list = new Readable_Stream<{ value: Writable_Stream<{ visible: boolean }> }[]>([A, B])
    // debugger;
    const filter = new Deep_Filter(
        list,
        ({ value }) => value,
        ({ visible }) => visible
    )
    expect(filter.get().length).toBe(1)
    B.value.set({ visible: false })
    expect(filter.get().length).toBe(0)
})
