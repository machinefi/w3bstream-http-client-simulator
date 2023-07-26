import { SimulatorSigner } from ".";

const PRIVATE_KEY_EXAMPLE =
  "1a9cd7dd19de448df9b85d93c4758558aa1d2f0b350e7788104951129d91c966";
const PUBLIC_KEY_EXAMPLE =
  "040fe48417be63d69b3afb77389b425af255b1aa6a97dd5e9923ee65e5184dd61afe356d23bd37c93f93d6632e124e62b4301c0a88c8477b44397b6709bd5fc98d";
const SIGNATURE_EXAMPLE =
  "3046022100b66ff451f7b8ba3b26d3f2145b827abfb66250a0cb6e168be52333ec3e41be90022100c098dd61b898b1a2e9f5d4ad4eb56ca6c6538b1d2ba66b19ab0a77dee1488376";
const DataPointTest = {
  temperature: 20,
  timestamp: 123456789,
};

const messageTest = JSON.stringify(DataPointTest);
let signature: string;

describe("simulator signer", () => {
  beforeEach(() => {
    signature = SimulatorSigner.sign(messageTest, PRIVATE_KEY_EXAMPLE);
  });
  it("should produce a correct signature", () => {
    expect(signature).toEqual(SIGNATURE_EXAMPLE);
  });
  it("should verify a message", () => {
    const result = SimulatorSigner.verify(
      messageTest,
      signature,
      PUBLIC_KEY_EXAMPLE
    );
    expect(result).toBeTruthy();
  });
});
