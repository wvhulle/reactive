import { Revertible } from './revertible.js'

import { expect, it } from 'vitest'

it('subscription', () => {
    const reactive = new Revertible<number>(2)
    // let oldDisplay: number | undefined = undefined;
    let display: number | undefined = undefined

    reactive.subscribe(v => (display = v))

    reactive.set(0)

    expect(display).toBe(0)

    reactive.set(1)

    expect(display).toBe(1)
})

// it('initial ready', () => {
// 	const reactive = new Revertible<number>();
// 	expect(!reactive.initial.ready);
// });

it('initial conserved', () => {
    const reactive = new Revertible<number>(0)
    // expect(reactive.initial.ready);
    reactive.set(1)
    expect(reactive.get()).toBe(1)
    expect(reactive.first.get()).toBe(0)
})

it('modified', () => {
    const reactive = new Revertible<number>(0)
    // expect(reactive.initial.ready);
    expect(reactive.modified.get()).toBe(false)
    reactive.set(1)
    expect(reactive.modified.get()).toBe(true)
    // expect(reactive.initial.now()).toBe(0);
})

it('reset', () => {
    const reactive = new Revertible<number>(0)
    // expect(reactive.initial.ready);
    reactive.set(1)
    expect(reactive.get()).toBe(1)
    reactive.reset()

    expect(reactive.get()).toBe(0)
})

it('save', () => {
    const reactive = new Revertible<number>(0)
    // expect(reactive.initial.ready);
    reactive.set(1)
    expect(reactive.modified.get()).toBe(true)
    reactive.save()
    expect(reactive.modified.get()).toBe(false)
    // expect(reactive.now()).toBe(1);
    expect(reactive.first.get()).toBe(1)
})
