import { SimulatorSigner } from "../SimulatorSigner";
import { DataPointGenerator } from "../DataPointGenerator";
import { SimulatorKeys } from "../SimulatorKeys";
import { PrivateKeyFile } from "../PrivateKeyFile";
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

  private initFromPathOrGenerateNew(pathToPk: string): void {
    try {
      const privateKey = PrivateKeyFile.getFromPath(pathToPk);
      const publicKey = SimulatorKeys.derivePublicKey(privateKey);
      this.updateId(privateKey, publicKey);
    } catch (err: any) {
      this.initializeNewId();
    }
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

  private initializeNewId(): void {
    const { privateKey, publicKey } = SimulatorKeys.generateId();
    this.updateId(privateKey, publicKey);
    PrivateKeyFile.save(privateKey);
  }

  private updateId(pk: string, pubk: string): void {
    this._privateKey = pk;
    this.publicKey = pubk;
  }
}
