import type { Readable_Stream } from '../primitive/readable.js'
import { Merge_Map } from './merge.js'

export class Map<Origin = unknown, Target = unknown> extends Merge_Map<Origin, Target> {
    constructor(reactive: Readable_Stream<Origin>, project: (original: Origin) => Target) {
        super([reactive], project)
    }
}
