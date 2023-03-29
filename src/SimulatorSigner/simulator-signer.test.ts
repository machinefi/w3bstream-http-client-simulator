import { SimulatorSigner } from "./";

const PRIVATE_KEY_EXAMPLE =
  "1a9cd7dd19de448df9b85d93c4758558aa1d2f0b350e7788104951129d91c966";
const PUBLIC_KEY_EXAMPLE =
  "040fe48417be63d69b3afb77389b425af255b1aa6a97dd5e9923ee65e5184dd61afe356d23bd37c93f93d6632e124e62b4301c0a88c8477b44397b6709bd5fc98d";

describe("SimulatorSigner", () => {
  it("should initialize", () => {
    const signer = new SimulatorSigner();
    expect(signer).toBeInstanceOf(SimulatorSigner);
  });
  it.only("should sign a message", () => {
    const signer = new SimulatorSigner();
    const message = "test";
    expect(() => signer.sign(message, PRIVATE_KEY_EXAMPLE)).not.toThrow();
  });
  it("should verify a message", () => {
    const signer = new SimulatorSigner();
    const message = "test";
    const signature = signer.sign(message, PRIVATE_KEY_EXAMPLE);
    const result = signer.verify(message, signature, PUBLIC_KEY_EXAMPLE);
    expect(result).toEqual(true);
  });
});
