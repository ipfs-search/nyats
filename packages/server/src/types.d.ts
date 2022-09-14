export enum Protocol {
  IPFS = "ipfs",
}

export type CID = string;
export type URL = string;
export type Path = string;

export enum Type {
  Unknown = "",
  Document = "document",
  Audio = "audio",
  Video = "video",
  Image = "image",
}

export interface Resource {
  protocol: Protocol;
  cid: CID;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ThumbnailRequest extends Resource, Dimensions {
  type?: Type;
}
