import crypto from "crypto";
import { Keccak } from "sha3";

import { Keys } from "src/types";

const curveName = "prime256v1";
const ecdh = crypto.createECDH(curveName);

export class SimulatorKeys {
  constructor() {}

  static generateKeys(): Keys {
    ecdh.generateKeys();

    return {
      publicKey: ecdh.getPublicKey("hex"),
      privateKey: ecdh.getPrivateKey("hex"),
    };
  }

  static derivePublicKey(privateKey: string): string {
    ecdh.setPrivateKey(privateKey, "hex");

    return ecdh.getPublicKey("hex");
  }
  
  static hashPublicKey(publicKey: string): string {
    const hash = new Keccak(256);

    hash.update(publicKey);
    return hash.digest("hex");
  }
}
