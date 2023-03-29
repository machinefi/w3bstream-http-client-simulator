import { SimulatorSigner } from "../SimulatorSigner";
import { DataPointGenerator } from "../DataPointGenerator";
import { IdGenerator } from "../IdGenerator";
import { IdFileManager } from "../IdFileManager";
import { Message, Payload } from "../types";

class NoDataPointGeneratorError extends Error {
  constructor() {
    super("No data point generator has been set");
  }
}

export class Simulator {
  private _privateKey: string = "";
  private _dataPointGenerator: DataPointGenerator<any> | undefined;

  public publicKey: string = "";

  constructor(private pub_id: string, private pub_token: string) {}

  init(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  set dataPointGenerator(generator: DataPointGenerator<any>) {
    this._dataPointGenerator = generator;
  }

  generateSingleMessage(): Message {
    const payload = this.generatePayload();
    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString).toString("base64");
    return {
      header: {
        pub_id: this.pub_id,
        pub_token: this.pub_token,
        event_type: "DATA",
      },
      payload: payloadBase64,
    };
  }

  private generatePayload(): Payload {
    const dataPoint = this.generateDataPoint();

    return {
      data: dataPoint,
      public_key: this.publicKey,
      signature: SimulatorSigner.sign(
        JSON.stringify(dataPoint),
        this._privateKey
      ),
    };
  }

  private generateDataPoint() {
    if (this._dataPointGenerator === undefined) {
      throw new NoDataPointGeneratorError();
    }
    return this._dataPointGenerator.generateDataPoint();
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
