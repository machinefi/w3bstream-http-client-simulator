export type Keys = {
  publicKey: string;
  privateKey: string;
};

export interface DataPoint {
  timestamp: number;
}

export interface W3bStreamMessage {
  data: DataPoint;
  deviceId: string;
  public_key: string;
  signature: string;
}
