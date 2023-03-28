import crypto from "crypto";

const curveName = "prime256v1";

type Keys = {
  publicKey: string;
  privateKey: string;
};

export class IdGenerator {
  constructor() {}

  generateId(): Keys {
    const ecdh = crypto.createECDH(curveName);
    ecdh.generateKeys();
    return {
      publicKey: ecdh.getPublicKey("hex"),
      privateKey: ecdh.getPrivateKey("hex"),
    };
  }
}
