import type { Writable_Stream } from '../primitive/writable.js'

export class Linked_Stream<Origin = unknown, Target = unknown> implements Writable_Stream<Target> {
    readonly created_on = new Date()
    private readonly source: Writable_Stream<Origin>
    private readonly extract: (original: Origin) => Target
    private readonly merge: (dependent: Target, original: Origin) => Origin

    constructor(
        stream: Writable_Stream<Origin>,
        map: (original: Origin) => Target,
        merge: (dependent: Target, original: Origin) => Origin
    ) {
        this.source = stream
        this.merge = merge
        this.extract = map
    }

    get last_written_on() {
        return this.source.last_written_on
    }

    set last_written_on(modification_time: Date | undefined) {
        this.source.last_written_on = modification_time
    }

    get number_of_subscriptions() {
        return this.source.number_of_subscriptions
    }
    get subscriptions() {
        return this.source.subscriptions.map(
            ({ id, on_publish: origin_subscriber, on_remove_subscription }) => ({
                id,
                on_publish: (target: Target) =>
                    origin_subscriber(this.merge(target, this.source.get())),
                on_remove_subscription: on_remove_subscription
                    ? (target?: Target) =>
                          on_remove_subscription(
                              target ? this.merge(target, this.source.get()) : undefined
                          )
                    : undefined
            })
        )
    }

    subscribe(
        on_publish: (t: Target) => void,
        on_remove_subscription?: ((value?: Target | undefined) => void) | undefined
    ): () => void {
        return this.source.subscribe(
            original => on_publish(this.extract(original)),
            original => {
                on_remove_subscription?.(original ? this.extract(original) : undefined)
                this.cancel_subscriptions()
            }
        )
    }

    set(newValue: Target): boolean {
        return this.source.set(this.merge(newValue, this.source.get()))
    }

    get interior() {
        return this.extract(this.source.interior)
    }

    get(): Target {
        return this.interior
    }

    update(updater: (t: Target) => Target): void {
        this.source.update(origin => {
            return this.merge(updater(this.extract(origin)), this.source.get())
        })
    }

    publish(): void {
        return this.source.publish()
    }

    cancel_subscriptions(): void {
        //this.source.cancel_subscriptions();
    }

    after<V>(reactive: Writable_Stream<V>) {
        return this.source.after(reactive)
    }
}
