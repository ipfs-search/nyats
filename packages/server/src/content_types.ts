import { Type } from "./types.js";

const types = {};

types[Type.document] = [
  // eBook types
  "application/x-mobipocket-ebook",
  "application/epub+zip",
  "application/vnd.amazon.ebook",
  // Scanned documents
  "image/vnd.djvu",
  "application/pdf",
  // HTML/plain text
  "text/html",
  "text/plain",
  // Text editors
  "application/postscript",
  "application/rtf",
  // Open Office et al.
  "application/vnd.oasis.opendocument.text",
  "application/vnd.sun.xml.writer",
  "application/vnd.stardivision.writer",
  "application/x-starwriter",
  // MS Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Misc
  "application/x-abiword",
];
types[Type.audio] = ["audio/*", "application/ogg"];
types[Type.video] = ["video/*", "application/mp4", "application/x-matroska"];
types[Type.image] = ["image/*"];

export default types;
