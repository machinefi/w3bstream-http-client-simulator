export type Keys = {
  publicKey: string;
  privateKey: string;
};

interface Header {
  pub_id: string;
  token: string;
  event_type: string;
  event_id: string;
  pub_time: number;
}

export interface DataPoint {
  timestamp: number;
}

export interface Payload {
  data: DataPoint;
  public_key: string;
  signature: string;
}

export interface W3bStreamEvent {
  header: Header;
  payload: Payload;
}

export interface Message {
  events: W3bStreamEvent[];
}
