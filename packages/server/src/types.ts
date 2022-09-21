export enum Protocol {
  ipfs,
}

export type URL = string;
export type Path = string;

export enum Type {
  document = "document",
  audio = "audio",
  video = "video",
  image = "image",
}

export interface Resource {
  protocol: Protocol;
  cid: string;
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
