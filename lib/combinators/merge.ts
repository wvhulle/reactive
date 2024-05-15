import { Readable_Stream } from '../primitive/readable.js'

export class Merge_Map<Origin = unknown, Target = unknown> extends Readable_Stream<Target> {
    sources: Readable_Stream<Origin>[]
    private readonly merge: (...original: Origin[]) => Target

    input_unsubscribers: ((v?: Target) => void)[] = []

    constructor(sources: Readable_Stream<Origin>[], merge: (...original: Origin[]) => Target) {
        super(merge(...sources.map(source => source.get())))

        this.merge = merge
        this.sources = sources

        this.input_unsubscribers = this.sources.map(
            (input_source, source_number) =>
                input_source.subscribe(new_input_value => {
                    const inputs = this.sources.map(s => s.get())
                    inputs[source_number] = new_input_value
                    this.interior = this.merge(...inputs)
                    this.publish()
                }),
            () => this.cancel_subscriptions()
        )
    }

    override cancel_subscriptions() {
        super.cancel_subscriptions()
        this.input_unsubscribers.forEach(s => s(this.interior))
        this.input_unsubscribers = []
    }
}
