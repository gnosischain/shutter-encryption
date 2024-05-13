import { bls12_381 } from "@noble/curves/bls12-381";
import { keccak256 } from "js-sha3";

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

/**
 * Exponentiates a pairing result by a scalar.
 * @param {bls12_381.PairingPoint} x - The pairing result (element in GT).
 * @param {bigint} exp - The exponent.
 * @returns {bls12_381.PairingPoint} - The result of exponentiation in GT.
 */
async function GTExp(
  x: typeof bls12_381.G1.ProjectivePoint,
  exp: bigint
): Promise<typeof bls12_381.G1.ProjectivePoint> {
  let a = x;
  let acc = bls12_381.G1.ProjectivePoint.ONE;

  while (exp > 0n) {
    if (exp & 1n) {
      acc = acc.multiply(a);
    }
    a = a.square();
    exp >>= 1n;
  }

  return acc;
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
  identity: typeof bls12_381.G1.ProjectivePoint,
  eonKey: typeof bls12_381.G2.ProjectivePoint
) {
  const p = await bls12_381.pairing(identity, eonKey);
  const preimage = await GTExp(p, r);
  const key = hash2(preimage); // Implement hash2 based on your requirements
  return xorBlocks(sigma, key); // Implement xorBlocks based on your requirements
}

function padAndSplit(msg: Uint8Array): Uint8Array[] {
  // Implement padding and splitting logic
  return []; // Placeholder
}

async function encrypt(
  msg: Uint8Array,
  identity: typeof bls12_381.G1.ProjectivePoint,
  eonKey: typeof bls12_381.G2.ProjectivePoint,
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
