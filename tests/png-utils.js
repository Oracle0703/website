const fs = require("node:fs");
const zlib = require("node:zlib");

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paeth(left, above, upperLeft) {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function decodePixels(idat, width, height, bytesPerPixel) {
  const rowLength = width * bytesPerPixel;
  const filtered = zlib.inflateSync(Buffer.concat(idat));
  const expectedLength = (rowLength + 1) * height;
  if (filtered.length !== expectedLength) {
    throw new Error(`Unexpected PNG payload length: ${filtered.length}; expected ${expectedLength}.`);
  }

  const pixels = Buffer.alloc(rowLength * height);
  for (let row = 0; row < height; row += 1) {
    const filter = filtered[row * (rowLength + 1)];
    const sourceOffset = row * (rowLength + 1) + 1;
    const targetOffset = row * rowLength;

    for (let column = 0; column < rowLength; column += 1) {
      const encoded = filtered[sourceOffset + column];
      const left = column >= bytesPerPixel ? pixels[targetOffset + column - bytesPerPixel] : 0;
      const above = row > 0 ? pixels[targetOffset + column - rowLength] : 0;
      const upperLeft =
        row > 0 && column >= bytesPerPixel
          ? pixels[targetOffset + column - rowLength - bytesPerPixel]
          : 0;
      let predictor = 0;

      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) predictor = paeth(left, above, upperLeft);
      else if (filter !== 0) throw new Error(`Unsupported PNG filter: ${filter}.`);

      pixels[targetOffset + column] = (encoded + predictor) & 0xff;
    }
  }

  return pixels;
}

function analyzeRgbPixels(pixels, bytesPerPixel) {
  const histogram = new Array(256).fill(0);
  const sums = [0, 0, 0];
  const squaredSums = [0, 0, 0];
  const pixelCount = pixels.length / bytesPerPixel;

  for (let offset = 0; offset < pixels.length; offset += bytesPerPixel) {
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const channels = [red, green, blue];

    for (let channel = 0; channel < channels.length; channel += 1) {
      sums[channel] += channels[channel];
      squaredSums[channel] += channels[channel] ** 2;
    }

    const luminance = Math.round(0.2126 * red + 0.7152 * green + 0.0722 * blue);
    histogram[luminance] += 1;
  }

  const channelStandardDeviations = sums.map((sum, channel) => {
    const mean = sum / pixelCount;
    return Math.sqrt(Math.max(0, squaredSums[channel] / pixelCount - mean ** 2));
  });
  const entropy = histogram.reduce((result, count) => {
    if (count === 0) return result;
    const probability = count / pixelCount;
    return result - probability * Math.log2(probability);
  }, 0);

  return { channelStandardDeviations, entropy };
}

function readPng(filePath, { analyzePixels = false } = {}) {
  const source = fs.readFileSync(filePath);
  if (!source.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error(`${filePath} is not a PNG file.`);
  }

  let offset = PNG_SIGNATURE.length;
  let metadata;
  const idat = [];

  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > source.length) throw new Error(`${filePath} contains a truncated PNG chunk.`);

    if (type === "IHDR") {
      metadata = {
        format: "png",
        width: source.readUInt32BE(dataStart),
        height: source.readUInt32BE(dataStart + 4),
        bitDepth: source[dataStart + 8],
        colorType: source[dataStart + 9],
        interlace: source[dataStart + 12]
      };
    } else if (type === "IDAT") {
      idat.push(source.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  if (!metadata) throw new Error(`${filePath} does not contain PNG metadata.`);
  if (!analyzePixels) return metadata;
  if (metadata.bitDepth !== 8 || metadata.interlace !== 0 || ![2, 6].includes(metadata.colorType)) {
    throw new Error(`${filePath} uses an unsupported PNG pixel format.`);
  }

  const bytesPerPixel = metadata.colorType === 6 ? 4 : 3;
  const pixels = decodePixels(idat, metadata.width, metadata.height, bytesPerPixel);
  return { ...metadata, ...analyzeRgbPixels(pixels, bytesPerPixel) };
}

module.exports = { readPng };
