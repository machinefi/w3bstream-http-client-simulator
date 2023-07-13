import { PrivateKeyFile, FileNotFound } from ".";

describe("private key file", () => {
  it("should throw if file not found", () => {
    expect(() => PrivateKeyFile.getFromPath("unexistingPath")).toThrow(
      FileNotFound
    );
  });
});
