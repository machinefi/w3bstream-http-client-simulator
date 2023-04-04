export class DataPointGenerator<T> {
  constructor(private generatorFunction: () => T) {}

  generateDataPoint(): T {
    return this.generatorFunction();
  }

  static randomizer(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static timestampGenerator(): number {
    return Date.now();
  }
}
