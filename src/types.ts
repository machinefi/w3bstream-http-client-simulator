export type Keys = {
  publicKey: string;
  privateKey: string;
};

interface Header {
  pub_id: string;
  token: string;
  event_type: string;
}

export interface DataPoint {
  timestamp: number;
}

export interface Payload {
  data: DataPoint;
  public_key: string;
  signature: string;
}

export interface Message {
  header: Header;
  payload: string; // The Base64 encoded string representing the `Payload` object
}
