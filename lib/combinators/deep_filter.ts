import { Readable_Stream } from '../primitive/readable.js'

export const mask = <Container, Value>(
    list: Container[],
    get_readable: (container: Container) => Readable_Stream<Value>,
    condition?: (v: Value) => boolean
) =>
    new Map(
        list.map((c, i) => [
            i,
            condition ? condition(get_readable(c).get()) : Boolean(get_readable(c).get())
        ])
    )

export class Deep_Filter<Container = unknown, Value = unknown> extends Readable_Stream<
    Container[]
> {
    private mask = new Map<number, boolean>()

    readonly source: Readable_Stream<Container[]>
    readonly get_readable: (original: Container) => Readable_Stream<Value>
    readonly condition?: (original: Value) => boolean

    private readonly source_unsubscriber: () => void
    private element_unsubscribers: ((v?: Container[]) => void)[] = []
    constructor(
        source: Readable_Stream<Container[]>,
        get_readable: (container: Container) => Readable_Stream<Value>,
        condition?: (original: Value) => boolean,
        strict?: boolean
    ) {
        const visibility = mask(source.get(), get_readable, condition)
        super(source.get().filter((_s, i) => visibility.get(i)))
        this.condition = condition
        this.source = source
        this.get_readable = get_readable
        this.mask = visibility
        // this.interior = this.source.get().filter((_s, i) => this.visibility.get(i));
        this.source_unsubscriber = this.source.subscribe(
            original_list => {
                this.element_unsubscribers.forEach(u => u())
                this.mask = mask(original_list, get_readable, condition)

                this.element_unsubscribers = original_list.map(
                    (container: Container, original_index: number) => {
                        const element_reactive_value = this.get_readable(container)

                        return element_reactive_value.subscribe(
                            (changed_element_value: Value) => {
                                // const current_list = this.get();
                                const was_visible = this.mask.get(original_index)
                                const visible_now =
                                    this.condition?.(changed_element_value) ??
                                    (!this.condition && Boolean(changed_element_value))
                                this.mask.set(original_index, visible_now)
                                if (strict ?? was_visible !== visible_now) {
                                    this.filter()
                                }
                            }
                            //() => this.cancel_subscriptions()
                        )
                    }
                )
                this.filter()
            },
            () => this.cancel_subscriptions()
        )
    }

    private filter() {
        this.interior = this.source.get().filter((_s, i) => this.mask.get(i))
        this.publish()
    }

    override cancel_subscriptions() {
        super.cancel_subscriptions()
        this.source_unsubscriber()
        this.element_unsubscribers.forEach(s => s(this.interior))
        this.element_unsubscribers = []
    }
}
