import crypto from "crypto";
import { ec as EC } from "elliptic";

const curveName = "p256";

export class SimulatorSigner {
  constructor() {}

  sign(message: string, pk: string): string {
    const ec = new EC(curveName);
    const ecPrivateKey = ec.keyFromPrivate(pk, "hex");
    const hash = crypto.createHash("sha256").update(message).digest();
    const signature = ecPrivateKey.sign(hash);
    return signature.toDER("hex");
  }

  verify(message: string, signature: string, publicKey: string): boolean {
    const ec = new EC(curveName);
    const ecPublicKey = ec.keyFromPublic(publicKey, "hex");
    const hash = crypto.createHash("sha256").update(message).digest();
    return ecPublicKey.verify(hash, signature);
  }
}
