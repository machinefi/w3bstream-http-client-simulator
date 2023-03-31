import crypto from "crypto";
import { Keys } from "src/types";

const curveName = "prime256v1";
const ecdh = crypto.createECDH(curveName);

export class SimulatorKeys {
  constructor() {}

  static generateId(): Keys {
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
}
