#!/bin/sh -x
#
# Generate thumbnails for various office-type documents.
# First uses OpenOffice to generate a PDF, then renders PDF into thumbnail of desired proportions.
# Generated file will be cropped to fill the exact dimensions specified.
#
# Requires OpenOffice command line tools.

INPUT=$1
OUTPUT=$2
WIDTH=$3
HEIGHT=$4

echo "Converting $INPUT to fit within ${WIDTH}x${HEIGHT}"

TMP_DIR=`mktemp -d`

# TODO:
# - Control output filename
# - Scale image using vips
# - Only convert first page
# - HTTP streaming (prevent reading full file, when possible)
# - Consider unoconv https://github.com/unoconv/unoconv (outdated)

# Convert office to image
soffice --convert-to pdf --outdir $TMP_DIR $INPUT
RETVAL=$?
if [ $RETVAL -ne 0 ]; then
	exit $RETVAL
fi

# Grab filename
TMP_FILE=$TMP_DIR/`ls -1 $TMP_DIR`

# Render image to proper scale
vipsthumbnail $TMP_FILE -e sRGB -t --size "${WIDTH}x${HEIGHT}" --smartcrop attention -s 128 -o $OUTPUT

# deletes the temp directory
function cleanup {
  rm -rf "$WORK_DIR"
  echo "Deleted temp working directory $WORK_DIR"
}

# register the cleanup function to be called on the EXIT signal
trap cleanup EXIT
