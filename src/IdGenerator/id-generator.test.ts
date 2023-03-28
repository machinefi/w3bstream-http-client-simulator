import { IdGenerator } from ".";

describe("IdGenerator", () => {
  it("should initialize", () => {
    const idGenerator = new IdGenerator();
    expect(idGenerator).toBeInstanceOf(IdGenerator);
  });
  it("should generate an id", () => {
    const idGenerator = new IdGenerator();
    const keys = idGenerator.generateId();
    expect(keys).toHaveProperty("publicKey");
    expect(keys).toHaveProperty("privateKey");
  });
});
