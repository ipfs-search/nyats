#!/bin/sh -x
#
# Create thumbnails for video files and images, supporting streaming over HTTP, using ffmpeg.
# Generated file will be cropped to fill the exact dimensions specified. It will grab a v-frame at the first 40% scene change
# after the first 3s, in order to yield more meaningful thumbnails.
#
# Usage:
# video-extractor.sh $INPUT $OUTPUT $WITDH $HEIGHT
#
# Example:
# ./video-extractor.sh https://gateway.ipfs.io/ipfs/QmdKC2fXuf6soDkKwZswjmYwqNzTPjnhwCyBuXpBsUvZaV/Barry.S02E02.The.Power.of.No.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv thumb.jpg 640 480
#
# Formats: anything supported by FFMPEG
# Example: MKV/MOV/MP4/JPEG/...(?)
#
# SVG: 5 Your ffmpeg needs to be compiled with --enable-librsvg
# Not supported: PDF, SVG, Office

INPUT=$1
OUTPUT=$2
WIDTH=$3
HEIGHT=$4

# Ref:
# Scaling - https://superuser.com/questions/547296/resizing-videos-with-ffmpeg-avconv-to-fit-into-static-sized-player/1136305#1136305
ffmpeg -ss 3 -i async:$INPUT -vf "select=gt(scene\,0.4), scale=$WIDTH:$HEIGHT:force_original_aspect_ratio=increase,crop=$WIDTH:$HEIGHT" -frames:v 1 -vsync vfr $OUTPUT
