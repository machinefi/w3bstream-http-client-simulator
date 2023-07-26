import { AxiosResponse } from "axios";
import { W3bstreamClient, WSHeader } from "w3bstream-client-js";

import { SimulatorSigner } from "../SimulatorSigner/index.js";
import { DataPointGenerator } from "../DataPointGenerator/index.js";
import { SimulatorKeys } from "../SimulatorKeys/index.js";
import { PrivateKeyFile } from "../PrivateKeyFile/index.js";
import { W3bStreamMessage } from "../types";

export class NoDataPointGeneratorError extends Error {}
export class SendingMessageError extends Error {}

export class Simulator {
  private _client: W3bstreamClient | undefined;
  private _privateKey: string = "";
  private _dataPointGenerator: DataPointGenerator<any> | undefined;
  private _interval: NodeJS.Timeout | undefined;

  public publicKey: string = "";

  constructor(deviceToken: string, httpRoute: string) {
    this._client = new W3bstreamClient(httpRoute, deviceToken);
  }

  init(pathToPrivateKey?: string) {
    this.initFromPathOrGenerateNew(pathToPrivateKey ?? "./");
  }

  generateSingleMessage(): W3bStreamMessage {
    const dataPoint = this.generateDataPoint();
    const signature = this.signDataPoint(dataPoint);

    return {
      data: dataPoint,
      public_key: this.publicKey,
      deviceId: "0x" + SimulatorKeys.hashPublicKey(this.publicKey),
      signature,
    };
  }

  powerOn(intervalInSec: number): void {
    const intervalInMs = intervalInSec * 1000;

    this._interval = setInterval(async () => {
      try {
        await this.sendSingleMessage();
      } catch (e) {
        console.log(e);
        console.log("Stopping simulator due to error");

        this.powerOff();
      }
    }, intervalInMs);
  }

  powerOff(): void {
    if (this._interval) {
      clearInterval(this._interval);

      delete this._interval;
    }
  }

  async sendSingleMessage(): Promise<{
    res: AxiosResponse | undefined;
    msg: W3bStreamMessage;
  }> {
    const message = this.generateSingleMessage();

    const header: WSHeader = {
      device_id: message.deviceId,
    };
    const res = await this._client?.publishDirect(header, message);

    if (!res) {
      throw new SendingMessageError("No response");
    }

    if (res?.status && (res.status < 200 || res.status >= 300)) {
      throw new SendingMessageError("Response status is: " + res.status);
    }

    this.logSuccessfulMessage(res, message);

    return { res, msg: message };
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
    res: AxiosResponse | undefined,
    msg: W3bStreamMessage
  ): void {
    console.log({
      httpResult: res?.status || "",
      w3bstreamError: res?.data?.errMsg || res?.data?.error || "",
      payload: msg,
    });
  }
}
