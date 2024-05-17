import { bls12_381 } from "@noble/curves/bls12-381";
import { keccak256 } from "js-sha3";
import { zip } from "lodash";

import { ProjPointType } from "@noble/curves/abstract/weierstrass";

const blsSubgroupOrder = BigInt(
  "0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffff00000001"
); //TODO: verify c# equivalent

function hash3(bytes: Uint8Array): bigint {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x3;
  preimage.set(bytes, 1);
  const hashHex = "0x" + keccak256(preimage);

  const result = BigInt(hashHex) % blsSubgroupOrder;

  return result;
}

// function hash3(bytes: Uint8Array, blsSubgroupOrder: UInt256): UInt256 {
//   const preimage = new Uint8Array(bytes.length + 1);
//   preimage[0] = 0x3;
//   preimage.set(bytes, 1);
//   const hash = keccak256.arrayBuffer(preimage);
//   const hashUint256 = new UInt256(new Uint8Array(hash));
//   return UInt256.mod(hashUint256, blsSubgroupOrder);
// }

type Fp12Type = ReturnType<typeof bls12_381.pairing>;

async function GTExp(x: Fp12Type, exp: bigint): Promise<Fp12Type> {
  let result = bls12_381.fields.Fp12.ONE;
  let acc = x;

  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) {
      result = bls12_381.fields.Fp12.mul(result, acc);
    }
    acc = bls12_381.fields.Fp12.sqr(acc);
    exp >>= BigInt(1);
  }

  return result;
}

async function computeR(sigma: Uint8Array, msg: Uint8Array): Promise<bigint> {
  const preimage = new Uint8Array(32 + msg.length);
  preimage.set(sigma);
  preimage.set(msg, 32);
  return hash3(preimage);
}

function computeC1(r: bigint) {
  const g2Generator = bls12_381.G2.ProjectivePoint.BASE;
  return g2Generator.multiply(r);
}

async function computeC2(
  sigma: Uint8Array,
  r: bigint,
  identity: ProjPointType<bigint>,
  eonKey: any
) {
  const p = await bls12_381.pairing(identity, eonKey);
  const preimage = await GTExp(p, r);
  const key = await hash2(preimage); // Implement hash2 based on your requirements
  return xorBlocks(sigma, key); // Implement xorBlocks based on your requirements
}

async function hash2(p: any): Promise<Uint8Array> {
  // Perform the final exponentiation and convert to big-endian bytes
  const finalExp = (bls12_381.fields.Fp12 as any).finalExponentiate(p);
  const bigEndianBytes = finalExp.toBytesBE();

  // Create the preimage with a prefix byte
  const preimage = new Uint8Array(1 + bigEndianBytes.length);
  preimage[0] = 0x2; // Prefix as per the original function
  preimage.set(bigEndianBytes, 1);

  // Hash the preimage using Keccak256 and return
  return new Uint8Array(keccak256.arrayBuffer(preimage));
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

function computeBlockKeys(sigma: Uint8Array, n: number): Uint8Array[] {
  const keys: Uint8Array[] = [];

  for (let suffix = 0; suffix < n; suffix++) {
    const preimage = new Uint8Array(36);
    preimage.set(sigma);
    new DataView(preimage.buffer).setInt32(32, suffix, false); // Big endian
    keys.push(hash4(preimage));
  }

  return keys;
}

function hash4(bytes: Uint8Array): Uint8Array {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x4;
  preimage.set(bytes, 1);
  const hash = keccak256.arrayBuffer(preimage);
  return new Uint8Array(hash);
}

export async function encrypt(
  msg: Uint8Array,
  identity: ProjPointType<bigint>,
  eonKey: any,
  sigma: Uint8Array
) {
  const r = await computeR(sigma, msg);

  const c1 = await computeC1(r);
  const c2 = await computeC2(sigma, r, identity, eonKey);
  const c3 = computeC3(padAndSplit(msg), sigma); // Implement computeC3 based on your requirements

  return {
    VersionId: 0x2,
    c1: c1,
    c2: c2,
    c3: c3,
  };
}

// test
const tx = {
  from: "0x3834a349678eF446baE07e2AefFC01054184af00",
  gasPrice: "2500000000",
  gas: "21000",
  to: "0x3834a349678eF446baE07e2AefFC01054184af00",
  value: "1000",
  data: "",
  nonce: "584",
  chainId: "10200",
  type: "0x0",
};

const jsonString = JSON.stringify(tx);

// Step 2: Encode the JSON string to a Uint8Array
const encoder = new TextEncoder();
const uint8Array = encoder.encode(jsonString);

console.log(uint8Array);

const identity = "";
