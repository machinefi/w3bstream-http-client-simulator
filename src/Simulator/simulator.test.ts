import { Simulator } from ".";

describe("Simulator", () => {
  it("should initialize", () => {
    const simulator = new Simulator();
    expect(simulator).toBeInstanceOf(Simulator);
  });
});
