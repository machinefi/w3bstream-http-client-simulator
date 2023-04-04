import crypto from "crypto";
import Elliptic from "elliptic";

const ec = new Elliptic.ec("p256");

export class SimulatorSigner {
  static sign(message: string, pk: string): string {
    const hash = SimulatorSigner.msgToHash(message);
    const ecPrivateKey = ec.keyFromPrivate(pk, "hex");

    const signature = ecPrivateKey.sign(hash);
    return signature.toDER("hex");
  }

  static verify(message: string, signature: string, pubK: string): boolean {
    const hash = SimulatorSigner.msgToHash(message);
    const ecPublicKey = ec.keyFromPublic(pubK, "hex");

    return ecPublicKey.verify(hash, signature);
  }

  static msgToHash(message: string): Buffer {
    return crypto.createHash("sha256").update(message).digest();
  }
}
