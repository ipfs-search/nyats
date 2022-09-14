export enum Protocol {
  ipfs,
}

export type CID = string;
export type URL = string;
export type Path = string;

export enum Type {
  document,
  audio,
  video,
  image,
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

export interface Thumbnailer {
  (request: ThumbnailRequest): Promise<URL>;
}
