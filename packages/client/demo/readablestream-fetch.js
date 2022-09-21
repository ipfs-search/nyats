import { IPNSThumbnailURL, GenerateThumbnailURL } from "nyats-client";

let thumbnail; // ReadableStream, see: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#reading_the_stream

const imgCid = "QmVP4JwZzM59TBzNKYu3LrrsQGohABxUoRLgYycRjF8A7d";
const cachedThumbnailURL = IPNSThumbnailURL(imgCid, 200, 200);
const response = await fetch(cachedThumbnailURL);
if (response.ok) {
  thumbnail = response.body;
} else {
  const generatedThumbnailURL = GenerateThumbnailURL(imgCid, 200, 200, "image");
  const response = await fetch(generatedThumbnailURL);

  if (response.ok) {
    thumbnail = response.body;
  }
}
