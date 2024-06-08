# Reactive data streams and combinators

This library in TypeScript has definitions and operators for reactive data streams. You can use this library to define streams, writable and readable and combine them or bind them to each other.

It's possible that I re-invented the wheel, but it was a fun exercise anyway.

## Primitives

These fundamental constructs are used by the rest of the library.

### Readable stream

This is a reactive variable that is compatible with the Svelte store contract. This means you can import it in Svelte code and subscribe to it using the dollar syntax.

See [source](./lib/primitive/readable.ts).

### Writable stream

This is the writable version of a readable stream.

### Revertible stream

This is a reactive variable that has an initial value. You can

1. reset to the initial value
2. save the current value as the initial value

It works by having two streams, the initial stream and the current stream. It then makes use of the merge map (see further below) to merge these two streams.

## Combinators

These are read-only reactive variables that can be constructed from other reactive variables.

### Merge map

The constructor takes a list of reactive variables and a map function. It outputs a read-only reactive variable.

See [source](./lib/combinators/merge.ts). For examples, see [tests](./lib/combinators/merge.spec.ts).

### Project

A special case of the merge map where the map function is a projection onto one argument. It is read-only.

### Deep filter

A read-only reactive variable that can be constructed from a list of items that have a representation of a reactive variable (there exists a function that maps each item to a reactive variable).

It works by storing a mask that filters out a bundle of reactive variables. For implementation, see [source](./lib/combinators/deep_filter.ts).

For example,

```ts
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
```

In this example, we create two items which are both objects containing a stream. They both have the same structural type. Then we create a streaming list that contains some of the created items, based on a filter function on the current value of the contained reactive variables.

For more examples, see [tests](./lib/combinators/deep_filter.spec.ts)

## Bindings

These are writable reactive variables that are bound one-to-one to another reactive variable.

### Linked stream

This is a reactive variable that is connected to an existing variable through:

- an extract function
- a merge function

Because this variable effectively links two streams, it also called 'linked stream'. For more information, see [source](./lib/bindings/bind.ts).

### Revertible binding

This is a special case of a linked stream that can be reset.

For example,

```ts
const w = new Writable_Stream<'OFF' | 'ON'>('ON')
const b = new Revertible_Bind<'OFF' | 'ON', boolean>(
    w,
    v => (v === 'OFF' ? false : true),
    v => (v ? 'ON' : 'OFF')
)

expect(w.get()).toBe('ON')
expect(b.get()).toBe(true)
expect(b.modified.get()).toBe(false)
w.set('OFF')
expect(b.get()).toBe(false)

expect(b.modified.get()).toBe(true)
```

For more examples, see [tests](./lib/bindings/revertible_bind.spec.ts)

## Further applications

It is possible to use this library for building a spreadsheet component in Svelte. You could for example have a reactive list of cells and use the above deep filter to build a reactive list of valid or empty cells.

## Credits

Written during a dancing trip with dancing school Shoonya (Ghent) in France.
