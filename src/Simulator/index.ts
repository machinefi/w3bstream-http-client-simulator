import { SimulatorSigner } from "../SimulatorSigner";
import { DataPointGenerator } from "../DataPointGenerator";
import { SimulatorKeys } from "../SimulatorKeys";
import { PrivateKeyFile } from "../PrivateKeyFile";
import { Message, Payload } from "../types";

class NoDataPointGeneratorError extends Error {}

abstract class BaseSimulator {
  protected _privateKey: string = "";
  protected _dataPointGenerator: DataPointGenerator<any> | undefined;

  public publicKey: string = "";

  constructor(protected pub_id: string, protected pub_token: string) {}

  abstract init(pathToPrivateKey?: string): void;

  abstract generateSingleMessage(): Message;

  set dataPointGenerator(generator: DataPointGenerator<any>) {
    this._dataPointGenerator = generator;
  }
}

export class Simulator extends BaseSimulator {
  constructor(pub_id: string, pub_token: string) {
    super(pub_id, pub_token);
  }

  init(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  generateSingleMessage(): Message {
    const payloadBase64 = this.generateAndEncodePayload();

    return {
      header: {
        pub_id: this.pub_id,
        pub_token: this.pub_token,
        event_type: "DATA",
      },
      payload: payloadBase64,
    };
  }

  set dataPointGenerator(generator: DataPointGenerator<any>) {
    this._dataPointGenerator = generator;
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

  private updateId(pk: string, pubk: string): void {
    this._privateKey = pk;
    this.publicKey = pubk;
  }

  private initializeNewId(): void {
    const { privateKey, publicKey } = SimulatorKeys.generateKeys();

    this.updateId(privateKey, publicKey);

    PrivateKeyFile.save(privateKey);
  }

  private generateAndEncodePayload(): string {
    const payload = this.generatePayload();
    const payloadString = JSON.stringify(payload);
    return Buffer.from(payloadString).toString("base64");
  }

  private generatePayload(): Payload {
    const dataPoint = this.generateDataPoint();
    const signature = this.signDataPoint(dataPoint);

    return {
      data: dataPoint,
      public_key: this.publicKey,
      signature,
    };
  }

  private signDataPoint(dataPoint: any): string {
    return SimulatorSigner.sign(JSON.stringify(dataPoint), this._privateKey);
  }

  private generateDataPoint() {
    if (this._dataPointGenerator === undefined) {
      throw new NoDataPointGeneratorError();
    }
    return this._dataPointGenerator.generateDataPoint();
  }
}
