import fs from "fs";

import { PrivateKeyFile, FileNotFound, ErrorSavingFile } from ".";

const PRIVATE_KEY_EXAMPLE =
  "1a9cd7dd19de448df9b85d93c4758558aa1d2f0b350e7788104951129d91c966";

describe("private key file", () => {
  afterEach(() => {
    fs.rmSync("./private.key", { force: true });
  });

  it("should save and retrieve private key from file", () => {
    PrivateKeyFile.save(PRIVATE_KEY_EXAMPLE);

    const privateKey = PrivateKeyFile.getFromPath("./");

    expect(privateKey).toEqual(PRIVATE_KEY_EXAMPLE);
  });
  it("should throw if file not found", () => {
    expect(() => PrivateKeyFile.getFromPath("unexistingPath")).toThrow(
      FileNotFound
    );
  });
  it("should throw if error saving file", () => {
    const mockWriteFile = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementationOnce(() => {
        throw new ErrorSavingFile();
      });

    expect(() => PrivateKeyFile.save("")).toThrow(ErrorSavingFile);

    mockWriteFile.mockRestore();
  });
});
