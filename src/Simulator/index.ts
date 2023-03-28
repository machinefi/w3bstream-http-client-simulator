import path from "path";
import fs from "fs";

import { IdGenerator } from "../IdGenerator";
import { Keys } from "../types";

export class Simulator {
  private _pk: string;
  public publicKey: string;

  constructor(pathToPk?: string) {
    if (pathToPk) {
      this._pk = this.getPKFromPath(pathToPk);
      this.publicKey = this.getPublicKey();
    } else {
      const keys = this.generateNewId();
      this._pk = keys.privateKey;
      this.publicKey = keys.publicKey;
    }
  }

  private getPKFromPath(pathToPk: string): string {
    const pk = fs.readFileSync(path.join(pathToPk, "private.key"));
    return pk.toString();
  }

  private getPublicKey(): string {
    const keys = IdGenerator.generateFromPk(this._pk);
    return keys.publicKey;
  }

  private generateNewId(): Keys {
    return IdGenerator.generateId();
  }
}
