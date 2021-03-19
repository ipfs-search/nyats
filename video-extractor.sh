#!/bin/sh

INPUT=$1
OUTPUT=$2

ffmpeg -ss 3 -i async:$INPUT -vf "select=gt(scene\,0.4)" -frames:v 1 -vsync vfr $OUTPUT
