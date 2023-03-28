import fs from "fs";
import path from "path";

import { IdGenerator } from "../IdGenerator";
import { Keys } from "../types";

export class Simulator {
  private _privateKey: string = "";
  public publicKey: string = "";

  constructor(pathToPrivateKey?: string) {
    this.initializeFromPath(pathToPrivateKey ?? "./");
  }

  private initializeFromPath(pathToPrivateKey: string): void {
    this._privateKey = this.getPrivateKeyFromPath(pathToPrivateKey);
    this.publicKey = this.derivePublicKey();
  }

  private initializeNewId(): void {
    const keys = this.generateNewId();
    this._privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;

    this.savePrivateKey();
  }

  private getPrivateKeyFromPath(pathToPrivateKey: string): string {
    try {
      const privateKey = fs.readFileSync(
        path.join(pathToPrivateKey, "private.key")
      );
      return privateKey.toString();
    } catch (err) {
      this.initializeNewId();
      return this._privateKey;
    }
  }

  private derivePublicKey(): string {
    const keys = IdGenerator.generateFromPk(this._privateKey);
    return keys.publicKey;
  }

  private generateNewId(): Keys {
    return IdGenerator.generateId();
  }

  private savePrivateKey(): void {
    const privateKey = this._privateKey;
    fs.writeFileSync(path.join("./", "private.key"), privateKey);
  }
}
