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

    const dataPointGeneratorFunction = () => ({
      timestamp: DataPointGenerator.timestampGenerator(),
      power: DataPointGenerator.randomizer(1, 100),
    });

    const dataPointGenerator = new DataPointGenerator<DataPoint>(
      dataPointGeneratorFunction
    );

    const dataPoint1 = dataPointGenerator.generateDataPoint();

    expect(dataPoint1.timestamp).toBeGreaterThan(0);
    expect(dataPoint1.power).toBeGreaterThan(0);

    const dataPoint2 = dataPointGenerator.generateDataPoint();

    expect(dataPoint1.power).not.toBe(dataPoint2.power);
  });
});
