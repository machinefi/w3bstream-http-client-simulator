import fs from "fs";
import path from "path";

class FileNotFound extends Error {}

export class IdFileManager {
  constructor() {}

  static getPrivateKeyFromPath(pathToPrivateKey: string): string {
    try {
      const privateKey = fs.readFileSync(
        path.join(pathToPrivateKey, "private.key")
      );
      return privateKey.toString();
    } catch (err) {
      throw new FileNotFound("File not found");
    }
  }

  static savePrivateKey(privateKey: string): void {
    fs.writeFileSync(path.join("./", "private.key"), privateKey);
  }
}
