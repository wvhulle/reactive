import { Merge_Map } from '../combinators/merge.js'
import type { Readable_Stream } from '../primitive/readable.js'
import type { Revertible } from '../primitive/revertible.js'
import { Writable_Stream } from '../primitive/writable.js'
import { Linked_Stream } from './bind.js'

import { clone } from 'lodash-es'

// import isNil from 'lodash-es/isNil';

export class Revertible_Bind<Origin = unknown, Target = unknown>
    extends Linked_Stream<Origin, Target>
    implements Revertible<Target>
{
    readonly first: Writable_Stream<Target>
    readonly modified: Readable_Stream<boolean>

    equality?: (a: Target, b: Target) => boolean

    constructor(
        reactive: Writable_Stream<Origin>,
        extract: (original: Origin) => Target,
        merge: (derived: Target, original: Origin) => Origin,
        equality?: (a: Target, b: Target) => boolean
    ) {
        super(reactive, extract, merge)
        this.first = new Writable_Stream<Target>(extract(clone(reactive.get())))
        this.equality = equality
        this.modified = new Merge_Map<Target, boolean>([this.first, this], (init, current) => {
            const modified = this.equality ? !this.equality(init, current) : init !== current

            return modified
        })
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
