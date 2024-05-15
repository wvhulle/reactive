import { Merge_Map } from '../combinators/merge.js'
import type { Readable_Stream } from './readable.js'
import { Writable_Stream } from './writable.js'

import clone from 'lodash-es/clone.js'

// import type { Serializable } from '@data/serializable';

export class Revertible<Content = unknown> extends Writable_Stream<Content> {
    readonly first: Writable_Stream<Content>

    readonly modified: Readable_Stream<boolean>
    equality?: (a: Content, b: Content) => boolean
    constructor(initial_interior: Content, equality?: (a: Content, b: Content) => boolean) {
        super(initial_interior)
        this.first = new Writable_Stream<Content>(clone(initial_interior))
        this.equality = equality
        this.modified = new Merge_Map<Content, boolean>([this.first, this], (init, current) =>
            this.equality ? !this.equality(init, current) : init !== current
        )
    }

    reset() {
        this.set(clone(this.first.get()))
        this.last_written_on = undefined
    }

    save() {
        this.first.set(clone(this.get()))
        this.last_written_on = undefined
    }
}
