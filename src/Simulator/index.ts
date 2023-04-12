import axios, { AxiosResponse } from "axios";

import { SimulatorSigner } from "../SimulatorSigner";
import { DataPointGenerator } from "../DataPointGenerator";
import { SimulatorKeys } from "../SimulatorKeys";
import { PrivateKeyFile } from "../PrivateKeyFile";
import { Message, Payload } from "../types";

class NoDataPointGeneratorError extends Error {}
class SendingMessageError extends Error {}

abstract class BaseSimulator {
  protected _privateKey: string = "";
  protected _dataPointGenerator: DataPointGenerator<any> | undefined;
  protected _interval: NodeJS.Timeout | undefined;

  public publicKey: string = "";

  constructor(
    protected pubId: string,
    protected pubToken: string,
    protected w3bstreamEndpoint: string
  ) {}

  abstract init(pathToPrivateKey?: string): void;

  abstract generateSingleMessage(): Message;

  abstract sendSingleMessage(): Promise<AxiosResponse | undefined>;

  abstract powerOn(intervalInSec: number): void;

  abstract powerOff(): void;

  set dataPointGenerator(generator: DataPointGenerator<any>) {
    this._dataPointGenerator = generator;
  }
}

export class Simulator extends BaseSimulator {
  constructor(pubId: string, pubToken: string, w3bstreamEndpoint: string) {
    super(pubId, pubToken, w3bstreamEndpoint);
  }

  init(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  generateSingleMessage(): Message {
    const payloadBase64 = this.generateAndEncodePayload();

    return {
      header: {
        pub_id: this.pubId,
        token: this.pubToken,
        event_type: "DATA",
      },
      payload: payloadBase64,
    };
  }

  powerOn(intervalInSec: number): void {
    const intervalInMs = intervalInSec * 1000;

    this._interval = setInterval(async () => {
      this.sendSingleMessage();
    }, intervalInMs);
  }

  powerOff(): void {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  async sendSingleMessage(): Promise<AxiosResponse | undefined> {
    const message = this.generateSingleMessage();

    try {
      const result = await axios.post(this.w3bstreamEndpoint, message);
      if (result.status !== 200) {
        throw new SendingMessageError(result.data);
      }
      return result;
    } catch (e) {
      console.log(e);
    }
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
