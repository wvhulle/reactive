
export class Readable_Stream<Interior = unknown> {
    interior: Interior
    readonly created_on = new Date()
    number_of_subscriptions = 0
    subscriptions: {
        id: number
        on_publish: (value: Interior) => void
        on_remove_subscription?: ((value?: Interior | undefined) => void) | undefined
    }[] = []

    constructor(first_interior: Interior) {
        this.interior = first_interior
    }

    subscribe(
        on_publish: (value: Interior) => void,
        on_remove_subscription?: ((value?: Interior | undefined) => void) | undefined
    ): () => void {
        //if (this.current_content !== undefined) {
        on_publish(this.interior)

        const id = this.number_of_subscriptions++
        this.subscriptions.push({
            id,
            on_publish,
            on_remove_subscription
        })
        return () => {
            this.subscriptions = this.subscriptions.filter(subscriber => subscriber.id !== id)
            if (on_remove_subscription) {
                on_remove_subscription(this.interior)
            }
        }
    }

    get(): Interior {
        return this.interior
    }

    publish() {
        this.subscriptions.forEach(subscription => {
            return subscription.on_publish(this.interior)
        })
    }

    cancel_subscriptions() {
        this.subscriptions.forEach(({ on_remove_subscription }) => {
            on_remove_subscription ? on_remove_subscription(this.interior) : undefined
        })
        this.subscriptions = []
    }

}
