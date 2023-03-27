export class DataPointGenerator<T> {
  constructor(private generatorFunction: () => T) {}

  generateDataPoint(): T {
    return this.generatorFunction();
  }
}
