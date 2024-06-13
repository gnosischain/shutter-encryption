import { bls12_381 } from "@noble/curves/bls12-381";
import { ProjPointType } from "@noble/curves/abstract/weierstrass";
import { hexToBytes, keccak256, bytesToBigInt, bytesToHex } from "viem";
import pkg from "lodash";
const { zip } = pkg;

const blsSubgroupOrderBytes = [
  0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09,
  0xa1, 0xd8, 0x05, 0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff,
  0xff, 0xff, 0x00, 0x00, 0x00, 0x01,
];
const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

// example of parameters:
// const rawTxHex =
//   "f869820248849502f900825208943834a349678ef446bae07e2aeffc01054184af008203e880824fd3a001e44318458b1f279bf81aef969df1b9991944bf8b9d16fd1799ed5b0a7986faa058f572cce63aaff3326df9c902d338b0c416c8fb93109446d6aadd5a65d3d115";
// const senderAddress = "3834a349678eF446baE07e2AefFC01054184af00";
// const identityPrefixHex =
//   "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";
// const eonKeyHex =
//   "B068AD1BE382009AC2DCE123EC62DCA8337D6B93B909B3EE52E31CB9E4098D1B56D596BF3C08166C7B46CB3AA85C23381380055AB9F1A87786F2508F3E4CE5CAA5ABCDAE0A80141EE8CCC3626311E0A53BE5D873FA964FD85AD56771F2984579";
// const sigmaHex =
//   "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";

export function encryptTx(
  rawTxHex: string,
  senderAddress: string,
  identityPrefixHex: string,
  eonKeyHex: string,
  sigmaHex: string
) {
  const identity = computeIdentity(identityPrefixHex, senderAddress);

  const encryptedMessage = encrypt(
    rawTxHex,
    identity,
    bls12_381.G2.ProjectivePoint.fromHex(eonKeyHex),
    sigmaHex
  );

  const encodedTx = encodeEncryptedMessage(encryptedMessage);
  return encodedTx;
}

export function computeIdentity(
  identityPrefixHex: string,
  senderAddress: string
): any {
  const preimage = "0x1" + identityPrefixHex + senderAddress;
  const hash = keccak256(preimage as `0x${string}`);
  const hashReversed = hexToBytes(hash).reverse();
  const hashReversedBigInt = bytesToBigInt(hashReversed) % bls12_381.G1.CURVE.n;
  const identity =
    bls12_381.G1.ProjectivePoint.BASE.multiply(hashReversedBigInt);
  return identity;
}

export function encrypt(
  msg: string,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>, // ProjPointType<Fp2>,
  sigma: string
) {
  const r = computeR(sigma, msg);

  const c1 = computeC1(r);
  const c2 = computeC2(hexToBytes(`0x${sigma}`));
  const c3 = computeC3(
    padAndSplit(hexToBytes(`0x${msg}`)),
    hexToBytes(`0x${sigma}`)
  );

  return {
    VersionId: 0x2,
    c1: c1,
    c2: c2,
    c3: c3,
  };
}

export function encodeEncryptedMessage(encryptedMessage: any): `0x${string}` {
  const c1Length = 192;
  const c2Length = 32;
  const c3Length = encryptedMessage.c3.length * 32;

  const totalLength = 1 + c1Length + c2Length + c3Length;
  const bytes = new Uint8Array(totalLength);

  bytes[0] = encryptedMessage.VersionId;
  bytes.set(encryptedMessage.c1.toRawBytes(false), 1);
  bytes.set(encryptedMessage.c2, 1 + c1Length);
  encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
    const offset = 1 + c1Length + c2Length + 32 * i;
    bytes.set(block, offset);
  });

  return bytesToHex(bytes);
}

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

function computeC2(sigma: Uint8Array) {
  const key = new Uint8Array(32);
  return xorBlocks(sigma, key);
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
