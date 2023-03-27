import { DataPointGenerator } from ".";

describe("DataPointGenerator", () => {
  it("should initialize", () => {
    const dataPointGenerator = new DataPointGenerator(() => ({}));
    expect(dataPointGenerator).toBeInstanceOf(DataPointGenerator);
  });
  it("should generate a custom data point shape", () => {
    type DataPoint = {
      timestamp: number;
      power: number;
    };
    const timestampGenerator = () => Date.now();
    const powerGenerator = () => Math.random();

    const dataPointGeneratorFunction = () => ({
      timestamp: timestampGenerator(),
      power: powerGenerator(),
    });

    const dataPointGenerator = new DataPointGenerator<DataPoint>(
      dataPointGeneratorFunction
    );

    const dataPoint = dataPointGenerator.generateDataPoint();
    expect(dataPoint).toHaveProperty("timestamp");
    expect(dataPoint).toHaveProperty("power");
  });
});
