import { IdGenerator } from "../IdGenerator";
import { IdFileManager } from "../IdFileManager";

export class Simulator {
  private _privateKey: string = "";
  public publicKey: string = "";

  constructor(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  sign(): string {
    return this._privateKey;
  }

  private initFromPathOrGenerateNew(pathToPk: string): void {
    try {
      const privateKey = IdFileManager.getPrivateKeyFromPath(pathToPk);
      const publicKey = IdGenerator.derivePublicKey(privateKey);
      this.updateId(privateKey, publicKey);
    } catch (err: any) {
      this.initializeNewId();
    }
  }

  private initializeNewId(): void {
    const { privateKey, publicKey } = IdGenerator.generateId();
    this.updateId(privateKey, publicKey);
    IdFileManager.savePrivateKey(privateKey);
  }

  private updateId(pk: string, pubk: string): void {
    this._privateKey = pk;
    this.publicKey = pubk;
  }
}
