import { CurveType, ProjPointType } from "@noble/curves/abstract/weierstrass";
import { bls12_381 } from "@noble/curves/bls12-381";
import { keccak256 } from "js-sha3";

// const blsSubgroupOrder = BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffff00000001"); //TODO: verify c# equivalent

const blsSubgroupOrder = BigInt(
  "52435875175126190479447740508185965837690552500527637822603658699938581184513"
);

type Fp12Type = ReturnType<typeof bls12_381.pairing>;

function hash3(bytes: Uint8Array): bigint {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x3;
  preimage.set(bytes, 1);
  const hashHex = "0x" + keccak256(preimage);

  const result = BigInt(hashHex) % blsSubgroupOrder;

  return result;
}

function computeR(sigma: Uint8Array, msg: Uint8Array): bigint {
  const preimage = new Uint8Array(32 + msg.length);
  preimage.set(sigma);
  preimage.set(msg, 32);
  return hash3(preimage);
}

function computeC1(r: bigint) {
  //TODO: verify r is littleEndian
  const g2Generator = bls12_381.G2.ProjectivePoint.BASE;
  return g2Generator.multiply(r);
}

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

// function computeC2(sigma: Uint8Array, r: bigint, identity: ProjPointType<bigint>, eonKey: ProjPointType<any>) //TODO: replacing any type by Fp2 type
//     {
//         const p = bls12_381.pairing(identity, eonKey);
//         GT preimage = ShutterCrypto.GTExp(p, r);
//         Bytes32 key = ShutterCrypto.Hash2(preimage);
//         return ShutterCrypto.XorBlocks(sigma, key);
//     }

// private static Bytes32 ComputeC2(Bytes32 sigma, UInt256 r, G1 identity, G2 eonKey)
//     {
//         GT p = new(identity, eonKey);
//         GT preimage = ShutterCrypto.GTExp(p, r);
//         Bytes32 key = ShutterCrypto.Hash2(preimage);
//         return ShutterCrypto.XorBlocks(sigma, key);
//     }

// async function encrypt(msg: Uint8Array, G1: typeof bls12_381.G1, G2: typeof bls12_381.G2, sigma: Uint8Array)
//     {
//         const r = computeR(sigma, msg);

//         EncryptedMessage c = new()
//         {
//             VersionId = 0x2,
//             c1 = ShutterCrypto.ComputeC1(r),
//             c2 = ComputeC2(sigma, r, identity, eonKey),
//             c3 = ComputeC3(PadAndSplit(msg), sigma)
//         };
//         return c;
//     }

function bigintToLittleEndianBytes(bigint: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Number(bigint & BigInt(0xff));
    bigint >>= BigInt(8);
  }
  return bytes;
}

export async function shutterTransaction() {}
