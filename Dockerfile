FROM alpine:latest

# libvips build deps
RUN apk add --no-cache alpine-sdk glib-dev expat-dev tiff-dev libjpeg-turbo-dev libgsf-dev automake autoconf gtk-doc gobject-introspection-dev libtool

# Get vips
ENV VIPS_VERSION 9f15567f2cf9388aa0f180c3f33e4d24989f1edf
RUN curl -sSL https://github.com/libvips/libvips/archive/$VIPS_VERSION.tar.gz \
		| tar -v  -xz

# Build vips
WORKDIR libvips-$VIPS_VERSION
RUN ./autogen.sh && ./configure && make && make install


RUN apk add --no-cache curl libreoffice ffmpeg

COPY *.sh /
