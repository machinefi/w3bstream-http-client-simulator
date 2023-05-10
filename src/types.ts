export type Keys = {
  publicKey: string;
  privateKey: string;
};

export interface DataPoint {
  timestamp: number;
}

export interface W3bStreamEvent {
  data: DataPoint;
  public_key: string;
  signature: string;
}

export interface Message {
  events: W3bStreamEvent[];
}
