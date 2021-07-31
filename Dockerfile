FROM alpine:latest

RUN apk add --no-cache curl libreoffice ffmpeg vips

COPY *.sh /
