#!/bin/sh -x
#
# Create thumbnails for images and vector files, supporting streaming over HTTP, using vips.
# Generated file will be cropped to fill the exact dimensions specified.
#
# It supports a good range of image formats, including JPEG, TIFF, PNG, WebP, HEIC, AVIF, FITS,
# Matlab, OpenEXR, PDF, SVG, HDR, PPM / PGM / PFM, CSV, GIF, Analyze, NIfTI, DeepZoom, and OpenSlide.
# It can also load images via ImageMagick or GraphicsMagick, letting it work with formats like DICOM.
#
# Files with colour profiles will be converted to sRGB.
#
# TODO: Streaming, already in vips 8.10.6-beta
# https://github.com/libvips/libvips/commit/fc4ad15f97d2c989e491774765c0b18ca8b558eb
# https://libvips.github.io/libvips/2019/11/29/True-streaming-for-libvips.html
#curl $1 | vipsthumbnail stdin -e sRGB --size "$WIDTHx$HEIGHT" --smartcrop attention -s 128 -o $OUTPUT

INPUT=$1
OUTPUT=$2
WIDTH=$3
HEIGHT=$4

vipsthumbnail $1 -e sRGB --size "$WIDTHx$HEIGHT" --smartcrop attention -s 128 -o $OUTPUT
