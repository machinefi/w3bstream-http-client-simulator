import crypto from "crypto";
import { Keys } from "src/types";

const curveName = "prime256v1";

export class IdGenerator {
  constructor() {}

  static generateId(): Keys {
    const ecdh = crypto.createECDH(curveName);
    ecdh.generateKeys();
    return {
      publicKey: ecdh.getPublicKey("hex"),
      privateKey: ecdh.getPrivateKey("hex"),
    };
  }

  static generateFromPk(privateKey: string): Keys {
    const ecdh = crypto.createECDH(curveName);
    ecdh.setPrivateKey(privateKey, "hex");
    return {
      publicKey: ecdh.getPublicKey("hex"),
      privateKey: ecdh.getPrivateKey("hex"),
    };
  }
}
