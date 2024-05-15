import { Readable_Stream } from "./readable.js";

export class Writable_Stream<
  Interior = unknown,
> extends Readable_Stream<Interior> {
  last_written_on?: Date;

  constructor(first_interior: Interior) {
    super(first_interior);
    this.interior = first_interior;
  }

  set(new_interior: Interior): boolean {
    const updated = new_interior !== this.interior;
    if (updated) {
      this.interior = new_interior;
      this.last_written_on = new Date();
      this.publish();
    }
    return updated;
  }

  update(transform: (interior: Interior) => Interior): void {
    if (this.interior === undefined) {
      throw new Error(`Data of reactive value is undefined. Cannot update.`);
    }
    this.set(transform(this.interior));
  }

  after<V>(stream: Writable_Stream<V>) {
    return (
      Math.max(
        ...[this.last_written_on?.getTime(), this.created_on.getTime()].filter(
          x => x !== undefined
        )  as number[],
      ) >=
      Math.max(
        ...[
          stream.last_written_on?.getTime(),
          stream.created_on.getTime(),
        ].filter(x => x !== undefined) as number[]
      )
    );
  }
}
