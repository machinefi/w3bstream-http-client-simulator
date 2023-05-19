import { SimulatorKeys } from ".";

const EXAMPLE_PRIVATE_KEY =
  "21ab5d1b4a6d52e55e93283d724617f5f6a33421f14604540719111b8d125802";
const EXAMPLE_PUBLIC_KEY =
  "044dbb54df802c49d3a18108b826ae4b22f65824d6f0485139ed46936ac8600032bcb2130c4c60fc87633fa3f0acb1031383ae331b121316baf6fc6204255d363e";
const EXAMPLE_HASHED_PUBLIC_KEY =
  "30ff42e5897ab396a02f83dccd42c066746d0de94e8c7b9a54d4fef22b8eed35";

describe("IdGenerator", () => {
  it("should initialize", () => {
    const idGenerator = new SimulatorKeys();
    expect(idGenerator).toBeInstanceOf(SimulatorKeys);
  });
  it("should generate an id", () => {
    const keys = SimulatorKeys.generateKeys();
    expect(keys).toHaveProperty("publicKey");
    expect(keys).toHaveProperty("privateKey");
  });
  it("should generate id from private key", () => {
    const publicKey = SimulatorKeys.derivePublicKey(EXAMPLE_PRIVATE_KEY);

    expect(publicKey).toEqual(EXAMPLE_PUBLIC_KEY);
  });
  it("should keccak256 hash the public key", () => {
    const hash = SimulatorKeys.hashPublicKey(EXAMPLE_PUBLIC_KEY);

    expect(hash).toHaveLength(64);
    expect(hash).toEqual(EXAMPLE_HASHED_PUBLIC_KEY);
  });
});
