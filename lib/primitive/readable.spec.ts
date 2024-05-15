import { Readable_Stream as Readable } from './readable.js'

import { expect, it } from 'vitest'

it('subscription', () => {
    const reactive = new Readable<number>(2)
    expect(reactive).toBeDefined()
})
