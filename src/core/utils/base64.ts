// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
/* eslint-disable */
/**
 * {@linkcode encode} and {@linkcode decode} for
 * [base64](https://en.wikipedia.org/wiki/Base64) encoding.
 *
 * This module is browser compatible.
 *
 * @example
 * ```ts
 * import {
 *   decode,
 *   encode,
 * } from "https://deno.land/std@$STD_VERSION/encoding/base64.ts";
 *
 * const b64Repr = "Zm9vYg==";
 *
 * const binaryData = decode(b64Repr);
 * console.log(binaryData);
 * // => Uint8Array [ 102, 111, 111, 98 ]
 *
 * console.log(encode(binaryData));
 * // => Zm9vYg==
 * ```
 *
 * @module
 */

const base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/",
];

const base64abcUrl = base64abc.slice(0, base64abc.length - 2).concat(["-", "_"]);

/**
 * CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
 * Encodes a given Uint8Array, ArrayBuffer or string into RFC4648 base64 representation
 * @param data
 */
export function encode(data: ArrayBuffer, url: boolean = false): string {
    return Buffer.from(data).toString(url ? "base64url" : "base64")
}
export function encode2(data: ArrayBuffer | string, url: boolean = false): string {
  const uint8 = typeof data === "string"
    ? new TextEncoder().encode(data)
    : data instanceof Uint8Array
    ? data
    : new Uint8Array(data);
  let result = "",
    i;

  const alphabet = url ? base64abcUrl : base64abc;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += alphabet[uint8[i - 2] >> 2];
    result += alphabet[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += alphabet[((uint8[i - 1] & 0x0f) << 2) | (uint8[i] >> 6)];
    result += alphabet[uint8[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += alphabet[uint8[i - 2] >> 2];
    result += alphabet[(uint8[i - 2] & 0x03) << 4];
    if (!url) {
      result += "==";
    }
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += alphabet[uint8[i - 2] >> 2];
    result += alphabet[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += alphabet[(uint8[i - 1] & 0x0f) << 2];
    if (!url) {
      result += "=";
    }
  }
  return result;
}

/**
 * Decodes a given RFC4648 base64 encoded string
 * @param b64
 */
export function decode(b64: string, url: boolean = false): Uint8Array {
  /* BROKEN
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
  */
  return Buffer.from(b64, url ? "base64url" : "base64");
}
