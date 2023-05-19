import axios, { AxiosResponse } from "axios";

import { SimulatorSigner } from "../SimulatorSigner";
import { DataPointGenerator } from "../DataPointGenerator";
import { SimulatorKeys } from "../SimulatorKeys";
import { PrivateKeyFile } from "../PrivateKeyFile";
import { W3bStreamMessage } from "../types";

class NoDataPointGeneratorError extends Error {}
class SendingMessageError extends Error {}

export class Simulator {
  private _privateKey: string = "";
  private _dataPointGenerator: DataPointGenerator<any> | undefined;
  private _interval: NodeJS.Timeout | undefined;

  public publicKey: string = "";

  constructor(private pubToken: string, private w3bstreamEndpoint: string) {}

  init(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  generateSingleMessage(): W3bStreamMessage {
    const dataPoint = this.generateDataPoint();
    const signature = this.signDataPoint(dataPoint);

    return {
      data: dataPoint,
      public_key: this.publicKey,
      signature,
    };
  }

  powerOn(intervalInSec: number): void {
    const intervalInMs = intervalInSec * 1000;

    this._interval = setInterval(async () => {
      const { res, msg } = await this.sendSingleMessage();
      if (res) {
        this.logSuccessfulMessage(res, msg);
      } else {
        this._interval && clearInterval(this._interval);
      }
    }, intervalInMs);
  }

  powerOff(): void {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }

  async sendSingleMessage(): Promise<{
    res: AxiosResponse | undefined;
    msg: W3bStreamMessage;
  }> {
    const message = this.generateSingleMessage();

    try {
      const res = await axios.post(this.w3bstreamEndpoint, message, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.pubToken,
        },
      });
      if (res.status < 200 || res.status >= 300) {
        throw new SendingMessageError("Response status is: " + res.status);
      }

      return { res, msg: message };
    } catch (e) {
      console.log(e);
      return { res: undefined, msg: message };
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

  private signDataPoint(dataPoint: any): string {
    return SimulatorSigner.sign(JSON.stringify(dataPoint), this._privateKey);
  }

  private generateDataPoint() {
    if (this._dataPointGenerator === undefined) {
      throw new NoDataPointGeneratorError();
    }
    return this._dataPointGenerator.generateDataPoint();
  }

  private logSuccessfulMessage(
    res: AxiosResponse,
    msg: W3bStreamMessage
  ): void {
    const deviceId = SimulatorKeys.hashPublicKey(msg.public_key);
    console.log({
      httpResult: res.status || "",
      w3bstreamError: res.data?.errMsg || res.data?.error || "",
      payload: msg,
      deviceId: `0x${deviceId}`,
    });
  }
}
