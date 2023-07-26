import fs from "fs";
import path from "path";

export class FileNotFound extends Error {}
export class ErrorSavingFile extends Error {}

export class PrivateKeyFile {
  static getFromPath(pathToPk: string): string {
    try {
      const filePath = path.join(pathToPk, "private.key");

      const privateKey = fs.readFileSync(filePath);
      return privateKey.toString();
    } catch (err) {
      throw new FileNotFound();
    }
  }

  static save(privateKey: string): void {
    const newPath = path.join("./", "private.key");

    try {
      fs.writeFileSync(newPath, privateKey);
    } catch (err) {
      throw new ErrorSavingFile();
    }
  }
}
