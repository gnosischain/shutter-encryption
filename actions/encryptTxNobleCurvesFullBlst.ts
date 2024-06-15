import { bls12_381 } from "@noble/curves/bls12-381";
import { hexToBytes, keccak256, bytesToBigInt, bytesToHex } from "viem";
import pkg from "lodash";
const { zip } = pkg;

import * as blstLib from "./blstBindings/bindings.js";
import { Blst, P1, P2, PT } from "./blstBindings/blst.hpp.js";

const blsSubgroupOrderBytes = [
  0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09,
  0xa1, 0xd8, 0x05, 0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff,
  0xff, 0xff, 0x00, 0x00, 0x00, 0x01,
];
const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

async function encryptData(
  msgHex: `0x${string}`,
  identityPreimageHex: `0x${string}`,
  eonKeyHex: `0x${string}`,
  sigmaHex: `0x${string}`
) {
  console.log("encryptData =========");
  const identity = await computeIdentityP1(identityPreimageHex);
  const eonKey = await computeEonKeyP2(eonKeyHex);
  const encryptedMessage = encrypt(msgHex, identity, eonKey, sigmaHex);
  // const encodedTx = encodeEncryptedMessage(encryptedMessage);
  // return encodedTx;
}

export async function computeIdentityP1(preimage: `0x${string}`): Promise<P1> {
  const preimageBytes = hexToBytes(
    ("0x1" + preimage.slice(2)) as `0x${string}`
  );

  const blst = await blstLib.getBlst();

  const p1 = new blst.P1();
  const identity = p1.hash_to(
    preimageBytes,
    "SHUTTER_V01_BLS12381G1_XMD:SHA-256_SSWU_RO_"
  );

  console.log("identity", bytesToHex(identity.serialize()).toUpperCase()); //ok
  return identity;
}

async function computeEonKeyP2(eonKeyHex: `0x${string}`): Promise<P2> {
  const blst = await blstLib.getBlst();
  const eonKey = new blst.P2(hexToBytes(eonKeyHex));
  console.log("eonKey", bytesToHex(eonKey.serialize()).toUpperCase());
  return eonKey;
}

async function encrypt(
  msgHex: `0x${string}`,
  identity: P1,
  eonKey: P2,
  sigmaHex: `0x${string}`
) {
  const r = computeR(sigmaHex.slice(2), msgHex.slice(2));
  // console.log("r", r);

  const c1 = computeC1(r);
  // console.log("c1", c1);

  const c2 = computeC2(sigmaHex, r, identity, eonKey);
  const c3 = computeC3(
    padAndSplit(hexToBytes(msgHex as `0x${string}`)),
    hexToBytes(sigmaHex as `0x${string}`)
  );

  return {
    VersionId: 0x2,
    c1: c1,
    c2: c2,
    c3: c3,
  };
}

// export function encodeEncryptedMessage(encryptedMessage: any): `0x${string}` {
//   const c1Length = 192;
//   const c2Length = 32;
//   const c3Length = encryptedMessage.c3.length * 32;

//   const totalLength = 1 + c1Length + c2Length + c3Length;
//   const bytes = new Uint8Array(totalLength);

//   bytes[0] = encryptedMessage.VersionId;
//   bytes.set(encryptedMessage.c1.toRawBytes(false), 1);
//   bytes.set(encryptedMessage.c2, 1 + c1Length);
//   encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
//     const offset = 1 + c1Length + c2Length + 32 * i;
//     bytes.set(block, offset);
//   });

//   return bytesToHex(bytes);
// }

//======================================
function computeR(sigmaHex: string, msgHex: string): bigint {
  const preimage = sigmaHex + msgHex;
  return hash3(preimage);
}

function computeC1(r: bigint) {
  const rLittleEndianBytes = bigintToLittleEndianBytes(r, 32);
  const rLittleEndian = bytesToBigInt(rLittleEndianBytes.reverse());
  if (rLittleEndian <= BigInt(0) || rLittleEndian >= bls12_381.G2.CURVE.n) {
    throw new Error(`Invalid value for rLittleEndian: ${rLittleEndian}`);
  }
  const g2Generator = bls12_381.G2.ProjectivePoint.BASE;
  return g2Generator.multiply(rLittleEndian);
}

// private static Bytes32 ComputeC2(Bytes32 sigma, UInt256 r, G1 identity, G2 eonKey)
// {
//     GT p = new(identity, eonKey);
//     GT preimage = ShutterCrypto.GTExp(p, r);
//     Bytes32 key = ShutterCrypto.Hash2(preimage);
//     return ShutterCrypto.XorBlocks(sigma, key);
// }
async function computeC2(
  sigmaHex: string,
  r: bigint,
  identity: P1,
  eonKey: P2
): Promise<any> {
  const blst = await blstLib.getBlst();

  console.log("computeC2....");
  // const one = blst.PT.one;
  // console.log("one", one);
  const p: PT = new blst.PT(identity, eonKey); // throws an error
  const preimage = await GTExp(p, r);
  const key = hash2(preimage);
  const result = xorBlocks(hexToBytes(sigmaHex as `0x${string}`), key);
  return result;
}

function computeC3(
  messageBlocks: Uint8Array[],
  sigma: Uint8Array
): Uint8Array[] {
  const keys = computeBlockKeys(sigma, messageBlocks.length);

  return zip(keys, messageBlocks).map(([key, block]) => {
    if (key === undefined || block === undefined) {
      throw new Error("Key or block is undefined");
    }
    return xorBlocks(key, block);
  });
}

//======================================
// public static Bytes32 Hash2(GT p)
// {
//     Span<byte> preimage = stackalloc byte[577];
//     preimage[0] = 0x2;
//     p.final_exp().to_bendian().CopyTo(preimage[1..]);
//     return HashBytesToBlock(preimage);
// }
// public static Bytes32 HashBytesToBlock(ReadOnlySpan<byte> bytes)
// {
//     return new(Keccak.Compute(bytes).Bytes);
// }
function hash2(p: PT): Uint8Array {
  const finalExp = p.final_exp().to_bendian();
  // const bytes = finalExp.toBytes();
  return keccak256(finalExp, "bytes");
}

function hash3(bytesHex: string): bigint {
  const preimage = hexToBytes(("0x3" + bytesHex) as `0x${string}`);
  const hash = keccak256(preimage, "bytes");
  const bigIntHash = bytesToBigInt(hash);
  const result = bigIntHash % blsSubgroupOrder;
  return result;
}

function hash4(bytes: Uint8Array): Uint8Array {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x4;
  preimage.set(bytes, 1);
  const hash = keccak256(preimage, "bytes");
  return hash;
}

//======================================
function bigintToLittleEndianBytes(bigint: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Number(bigint & BigInt(0xff));
    bigint >>= BigInt(8);
  }
  return bytes;
}

function xorBlocks(x: Uint8Array, y: Uint8Array): Uint8Array {
  if (x.length !== y.length) {
    throw new Error("Both byte arrays must be of the same length.");
  }

  const result = new Uint8Array(x.length);
  for (let i = 0; i < x.length; i++) {
    result[i] = x[i] ^ y[i];
  }
  return result;
}

function computeBlockKeys(sigma: Uint8Array, n: number): Uint8Array[] {
  return Array.from({ length: n }, (_, x) => {
    const suffix = Buffer.alloc(4);
    suffix.writeUInt32BE(x, 0);
    let suffixLength = 4;
    for (let i = 0; i < 3; i++) {
      if (suffix[i] !== 0) break;
      suffixLength--;
    }
    const effectiveSuffix = Buffer.from(suffix.slice(4 - suffixLength));
    const preimage = Buffer.concat([sigma, effectiveSuffix]);
    return hash4(preimage);
  });
}

function padAndSplit(bytes: Uint8Array): Uint8Array[] {
  const blockSize = 32;
  const paddingLength = blockSize - (bytes.length % blockSize);
  const padded = new Uint8Array(bytes.length + paddingLength);
  padded.set(bytes);
  padded.fill(paddingLength, bytes.length);
  const result: Uint8Array[] = [];
  for (let i = 0; i < padded.length; i += blockSize) {
    result.push(padded.slice(i, i + blockSize));
  }
  return result;
}

// to test
async function GTExp(x: PT, exp: bigint): Promise<PT> {
  const blst = await blstLib.getBlst();

  let a: PT = x;
  let acc: PT = blst.PT.one(); // ???

  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) {
      acc.mul(a);
    }
    a.sqr();
    exp >>= BigInt(1);
  }

  return acc;
}

export { encryptData };
