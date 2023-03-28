import { Simulator } from ".";

const EXAMPLE_PUBLIC_KEY =
  "044dbb54df802c49d3a18108b826ae4b22f65824d6f0485139ed46936ac8600032bcb2130c4c60fc87633fa3f0acb1031383ae331b121316baf6fc6204255d363e";

describe("Simulator", () => {
  it("should initialize", () => {
    const simulator = new Simulator();
    expect(simulator).toBeInstanceOf(Simulator);
  });
  it("should initialize from private key in file", () => {
    const simulator = new Simulator("./config");

    expect(simulator.publicKey).toEqual(EXAMPLE_PUBLIC_KEY);
  });
  it("should initialize if no private key is provided", () => {
    const simulator = new Simulator();

    const pubKey = simulator.publicKey;
    expect(pubKey.length).toEqual(130);
  });
});
