import { bls12_381 } from "@noble/curves/bls12-381";
import { zip } from "lodash";
import { stringToBytes, hexToBytes, toBytes, type Address, keccak256, bytesToBigInt, bytesToHex, numberToBytes, numberToHex } from "viem";

import { AffinePoint, ProjPointType } from "@noble/curves/abstract/weierstrass";

const blsSubgroupOrderBytes = [0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09, 0xa1, 0xd8, 0x05, 0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x01];

const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

// const ORDER = BigInt('52435875175126190479447740508185965837690552500527637822603658699938581184513'); // ORDER from the Go implementation


const BlockSize = 32;
type Fp12Type = ReturnType<typeof bls12_381.pairing>;
type Block = Uint8Array & { length: 32 };

function hashWithPrefix(prefix: number, data: Uint8Array): Uint8Array {
  const dataArray = Array.from(data);
  const prefixedData = new Uint8Array([prefix, ...dataArray]);
  const hashHex = keccak256(prefixedData);
  return Uint8Array.from(Buffer.from(hashHex, "hex"));
}

function hash1(b: Uint8Array) {
  const h = hashWithPrefix(1, b);
  const n = BigInt('0x' + Buffer.from(h).toString('hex'));
  const p = bls12_381.G1.ProjectivePoint.ZERO;
  return p.multiply(n);
}

function computeEpochID(epochIDBytes: Uint8Array) {
  const point = hash1(epochIDBytes);
  return point;
}

function makeKeys() {
  const n = 3;
  const threshold = 2;
  const epochID = computeEpochID(new TextEncoder().encode("epoch1"));

}



function GTExp(x: Fp12Type, exp: bigint): Fp12Type {
  let a = x;
  let acc = bls12_381.fields.Fp12.ONE;

  while (exp > BigInt(0)) {
    if ((exp & BigInt(1)) === BigInt(1)) {
      acc = bls12_381.fields.Fp12.mul(acc, a);
    }
    a = bls12_381.fields.Fp12.sqr(a);
    exp >>= BigInt(1);
  }

  return acc;
}

function computeR(sigma: Uint8Array, msg: Uint8Array): bigint {
  const preimage = new Uint8Array(32 + msg.length);
  preimage.set(sigma);
  preimage.set(msg, 32);
  return hash3(preimage);
}

function computeC1(r: bigint) {
  const g2Generator = bls12_381.G2.ProjectivePoint.BASE;

  // Convert r to little-endian bytes
  const rLittleEndianBytes = bigintToLittleEndianBytes(r, 32);

  // Convert little-endian bytes to bigint
  const rLittleEndian = bytesToBigInt(rLittleEndianBytes.reverse());

  // Validate rLittleEndian is within the expected range
  if (rLittleEndian <= BigInt(0) || rLittleEndian >= bls12_381.G2.CURVE.n) {
    throw new Error(`Invalid value for rLittleEndian: ${rLittleEndian}`);
  }

  // Multiply the G2 generator by rLittleEndian
  return g2Generator.multiply(rLittleEndian);
}

function bigintToLittleEndianBytes(bigint: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Number(bigint & BigInt(0xff));
    bigint >>= BigInt(8);
  }
  return bytes;
}

function computeC2(sigma: Uint8Array, r: bigint, epochID: ProjPointType<any>, eonKey: ProjPointType<any>) {
  const p = bls12_381.pairing(eonKey, epochID);
  //   const pBytes = bls12_381.fields.Fp12.toBytes(p);
  const preimage = GTExp(p, r);
  const key = hash2(preimage);
  console.log("key", bytesToHex(key));
  return xorBlocks(sigma, key);
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

function computeC3(messageBlocks: Uint8Array[], sigma: Uint8Array): Uint8Array[] {
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

function hash2(p: any): Uint8Array {
  // Perform the final exponentiation and convert to big-endian bytes
  const finalExp = (bls12_381.fields.Fp12 as any).finalExponentiate(p);

  console.log("===final checkk");
  const pBytes = bls12_381.fields.Fp12.toBytes(finalExp);
  // console.log("pBytes", pBytes);
  // const hexBytes = bytesToHex(pBytes);
  // console.log("final exp", hexBytes);

  // const bigEndianBytes = fp12ToBigEndianBytes(finalExp);
  // const bigEndianTest = hexToBytes(
  //   // from NETHERMIND
  //   "0x140D7B94BD5C83A91BBC505AE74439482AE9440367116FC5D85DDBECEC97EF1C00AA39C4967830C83872B32784B31F9703ED96C7ED88CD25C269B9DB1B812057D2AC8D53325C41874C1B56E46A504EF69D9BA38956E15F41EA44130BFB3957AC162F011BECDF159C3AD3DDB24AD0D1868465D8DED07A5CF3830B52F929F49A964874736986DCC5FEE0359040494516BC09345A51A06838C8CE5DDEBE016416606025596B57972EFC1BC6103658E93A7DDF3A9CBD067BBB718B33AA0E3E8C488B116FB5C7110B07A40A0BDEB79B91AE1E049E86BFC2DC1D8920934C9DC44F17711C7EFD120BD73FBAB29499D8CAED5D2A109C1299A0CD290C38633C51E4871746B139E3325C4C2D6633FFC53D36C505218F25FEC3B27E35E6A2DFE100F806EF4E155A5EB4494E2591E33110B497022BC8D3D5D139CFE95390A298B5083E532FFCFEBB493EB8715163FF9F1AED002707C6113D6E732EC4DE781E2A95865E0A1BE85F5BC39331E33228EEE285D2BC291DA54D9A5FCC917D6D975CF174A4017F7FA918C3B1521AA43A4A6F1AA72269EAF9875E4322D0A4632A97896D67A398E00265EFDC3D87DE9AE0DE9CFD790598B02B2C06310E19771ED0BD8428BEAAF12D004BDCE337DDFF761008856DA826E027B68DB06B79C7053D0D0BDF9DD63EA920EA7F00D324D1E6E750E2667E0D8EFCEADAC1D4FAAEE2A16CDD37570B399315A3440FF89688453A861D8196069E00F132D336190F814D43FB4C1BD891A12CA105B3009307CDCE2A23E0F268CCC3A7020DEA642A6752D22EDE1E4E8FF294A2893AE976"
  // );

  // console.log("===bigEndianBytes", bytesToHex(bigEndianBytes));

  // Create the preimage with a prefix byte
  // const preimage = new Uint8Array(1 + bigEndianBytes.length);
  // preimage[0] = 0x2;
  // preimage.set(bigEndianBytes, 1);

  // test
  const preimageTest = new Uint8Array(1 + pBytes.length);
  preimageTest[0] = 0x2;
  preimageTest.set(pBytes, 1);

  console.log("===preimage", bytesToHex(preimageTest));

  return keccak256(preimageTest, "bytes");
}

function hash3(bytes: Uint8Array): bigint {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x3;
  preimage.set(bytes, 1);
  const hash = keccak256(preimage, "bytes");
  const bigIntHash = bytesToBigInt(hash.reverse());
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

export function encrypt(
  message: Uint8Array,
  eonPublicKey: ProjPointType<any>, //G2Type
  epochID: ProjPointType<any>, //G1Type
  sigma: Block
) {
  const messageBlocks = padMessage(message);
  const r = computeR(sigma, message);
  const c1 = computeC1(r);
  const c2 = computeC2(sigma, r, epochID, eonPublicKey);
  const c3 = computeC3(messageBlocks, sigma);

  return {
    VersionId: 0x2,
    c1: c1,
    c2: c2,
    c3: c3,
  };
}

function padMessage(m: Uint8Array): Block[] {
  const paddingLength = BlockSize - (m.length % BlockSize);
  const padding = new Uint8Array(paddingLength).fill(paddingLength);
  const paddedMessage = new Uint8Array(m.length + padding.length);
  paddedMessage.set(m, 0);
  paddedMessage.set(padding, m.length);

  const numBlocks = Math.ceil(paddedMessage.length / BlockSize);
  const blocks: Block[] = [];

  for (let i = 0; i < numBlocks; i++) {
    const blockData = paddedMessage.slice(i * BlockSize, (i + 1) * BlockSize);
    const block = new Uint8Array(BlockSize) as Block;
    block.set(blockData);
    blocks.push(block);
  }

  return blocks;
}

function computeIdentity(identityPrefix: Uint8Array, sender: Uint8Array): any {
  const combinedLength = 52; // identityPrefix.length + sender.length;
  const preimage = new Uint8Array(combinedLength);
  console.log("identityPrefix", bytesToHex(identityPrefix));
  console.log("identityPrefix Bigint", bytesToBigInt(identityPrefix));
  console.log("sender", bytesToHex(sender));
  preimage.set(identityPrefix);
  // preimage.set(sender, identityPrefix.length);
  preimage.set(sender, 32);

  return computeIdentityFromPreimage(preimage);
}

function computeIdentity2(identityPrefixHex: string, senderAddress: string) {
  // const identityPrefixBytes = hexToBytes(`0x${identityPrefixHex}`, { size: 32 });
  // const senderBytes = hexToBytes(`0x${senderAddress}`);
  // const preimage = new Uint8Array(53);
  // preimage[0] = 0x1;
  // preimage.set(identityPrefixBytes, 1);
  // preimage.set(senderBytes, 33);

  // return computeIdentityFromPreimage(preimage);

  const preimage = identityPrefixHex + senderAddress;
  console.log("preimage", preimage);
  return computeIdentityFromPreimage2(preimage);
}

function computeIdentityFromPreimage(bytes: Uint8Array): any {
  // console.log("computeIdentityFromPreimage ======");
  // const preimage = new Uint8Array(bytes.length + 1);
  const preimage = new Uint8Array(53);
  preimage[0] = 0x1;
  preimage.set(bytes, 1);

  // console.log("preimage", bytesToBigInt(preimage));

  const hash = keccak256(preimage, "bytes");
  // console.log("hash", bytesToBigInt(hash));
  hash.reverse();
  // console.log("hash", bytesToBigInt(hash));

  const hashBigInt = bytesToBigInt(hash) % bls12_381.G1.CURVE.n;
  // console.log("hashBigInt", hashBigInt);

  // const bigIntHash = BigInt("0x" + Buffer.from(hash).toString("hex"));

  // const result = bls12_381.G1.ProjectivePoint.BASE.multiply(hashBigInt);
  // console.log("result", result.toHex());

  return bls12_381.G1.ProjectivePoint.BASE.multiply(hashBigInt);
}

function computeIdentityFromPreimage2(bytesString: string): any {
  // console.log("computeIdentityFromPreimage ======");
  // const preimage = new Uint8Array(bytes.length + 1);
  // const preimage = new Uint8Array(53);
  // preimage[0] = 0x1;
  // preimage.set(bytes, 1);
  const preimage = "0x1" + bytesString;

  // console.log("preimage", preimage);

  const hash = keccak256(preimage as `0x${string}`, "bytes");
  // console.log("hash before reverse", bytesToBigInt(hash));
  // hash.reverse();
  // console.log("hash after reverse", bytesToBigInt(hash));

  const hashBigInt = bytesToBigInt(hash) % bls12_381.G1.CURVE.n;
  // console.log("hashBigInt", hashBigInt);

  // const bigIntHash = BigInt("0x" + Buffer.from(hash).toString("hex"));

  // const result = bls12_381.G1.ProjectivePoint.BASE.multiply(hashBigInt);
  // console.log("result", result.toHex());

  return bls12_381.G1.ProjectivePoint.BASE.multiply(hashBigInt);
}
// [Test][
//   TestCase(
//     "f869820248849502f900825208943834a349678ef446bae07e2aeffc01054184af008203e880824fd3a001e44318458b1f279bf81aef969df1b9991944bf8b9d16fd1799ed5b0a7986faa058f572cce63aaff3326df9c902d338b0c416c8fb93109446d6aadd5a65d3d115",
//     "3834a349678eF446baE07e2AefFC01054184af00",
//     "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834",
//     "B068AD1BE382009AC2DCE123EC62DCA8337D6B93B909B3EE52E31CB9E4098D1B56D596BF3C08166C7B46CB3AA85C23381380055AB9F1A87786F2508F3E4CE5CAA5ABCDAE0A80141EE8CCC3626311E0A53BE5D873FA964FD85AD56771F2984579",
//     "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834"
//   )
// ];

function toHexString(bytes: number[] | Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function testEncrypt() {
  const message = hexToBytes(`0x${toHexString([104, 101, 108, 108, 111])}`);
  const eonPublicKeyBytes = hexToBytes(
    `0x${toHexString([
      7, 197, 34, 108, 54, 38, 140, 198, 144, 223, 63, 215, 160, 142, 179, 61, 54, 55, 20, 204, 194, 36, 98, 222, 137, 28, 216, 78, 19, 36, 247, 73, 236, 196, 30, 179, 26, 114, 246, 107, 250, 65, 215, 41, 14, 51, 189, 95, 1, 7, 29, 201, 82, 50, 191, 29, 245, 99, 113, 45, 109, 155, 85, 172, 22, 27,
      218, 142, 244, 73, 78, 6, 252, 190, 14, 195, 190, 102, 216, 188, 255, 124, 223, 154, 163, 12, 188, 249, 36, 170, 65, 163, 96, 150, 230, 42, 19, 251, 119, 215, 202, 221, 14, 135, 11, 3, 50, 82, 200, 224, 33, 82, 92, 94, 224, 90, 82, 142, 230, 186, 117, 9, 14, 70, 198, 254, 214, 22, 141, 48,
      106, 82, 22, 163, 176, 159, 252, 221, 188, 6, 132, 159, 85, 145, 10, 65, 251, 73, 205, 129, 106, 166, 140, 221, 45, 69, 1, 131, 158, 211, 209, 196, 60, 162, 112, 13, 18, 224, 145, 34, 251, 164, 36, 202, 216, 136, 49, 155, 203, 147, 90, 247, 226, 1, 91, 117, 195, 102, 206, 88, 137, 112,
    ])}`
  );

  const epochIDBytes = hexToBytes(
    `0x${toHexString([
      4, 38, 103, 139, 222, 52, 22, 209, 75, 86, 239, 142, 156, 31, 227, 138, 115, 12, 222, 12, 170, 224, 99, 25, 5, 16, 105, 103, 53, 36, 87, 147, 155, 251, 105, 162, 163, 53, 135, 79, 44, 200, 152, 54, 51, 28, 14, 54, 1, 205, 145, 129, 159, 218, 141, 124, 86, 4, 136, 52, 162, 89, 164, 127, 39,
      175, 205, 96, 68, 63, 222, 129, 191, 101, 61, 48, 120, 39, 22, 101, 60, 210, 245, 47, 138, 87, 62, 4, 109, 38, 237, 128, 229, 43, 197, 140,
    ])}`
  );

  const sigmaBytes = hexToBytes(`0x${toHexString([56, 101, 100, 98, 89, 35, 141, 114, 164, 70, 50, 15, 95, 242, 168, 16, 203, 40, 143, 58, 133, 9, 32, 194, 250, 90, 198, 69, 202, 115, 83, 80])}`);

  console.log(message);
  let eonPoint: AffinePoint<any> | undefined;
  let eonProjPoint: ProjPointType<any> | undefined;
  let epochPoint: AffinePoint<any> | undefined;
  let epochProjPoint: ProjPointType<any> | undefined;

  if (bls12_381.G2.CURVE.fromBytes && bls12_381.G1.CURVE.fromBytes) {
    eonPoint = bls12_381.G2.CURVE.fromBytes(eonPublicKeyBytes);
    const p = bls12_381.G2.ProjectivePoint.fromHex(eonPublicKeyBytes);
    console.log(p);
    if (eonPoint) {
      eonProjPoint = bls12_381.G2.ProjectivePoint.fromAffine(eonPoint);
      console.log(eonPoint);
    } else {
      console.error("Failed to create eonPoint from bytes");
    }

    epochPoint = bls12_381.G1.CURVE.fromBytes(epochIDBytes);
    if (epochPoint) {
      epochProjPoint = bls12_381.G1.ProjectivePoint.fromAffine(epochPoint);
      console.log(epochPoint);
    } else {
      console.error("Failed to create epochPoint from bytes");
    }

    if (eonProjPoint && epochProjPoint) {
      // const p = bls12_381.pairing(eonProjPoint, epochProjPoint);
      // const encryptedMessage = encrypt(message, eonProjPoint, epochProjPoint, sigmaBytes as Block);
      // console.log(encryptedMessage);
    } else {
      console.error("One or both projective points could not be created");
    }
  } else {
    console.error("fromBytes method does not exist on one or both CURVEs");
  }

  //   console.log(encryptedMessage);

  //   const encoded: Uint8Array = encodeEncryptedMessage(encryptedMessage);

  //   const encryptedTx = bytesToHex(encoded);

  //   console.log("encrypted TX");
  //   console.log(encryptedTx.toUpperCase());
}

function encodeEncryptedMessage(
  encryptedMessage: any // EncryptedMessage
): Uint8Array {
  const c1Length = 96; // Assuming the compressed c1 is 96 bytes
  const c2Length = 32; // Assuming the unwrapped c2 is 32 bytes
  const c3Length = encryptedMessage.c3.length * 32; // Assuming each c3 element is 32 bytes

  const totalLength = 1 + c1Length + c2Length + c3Length;
  const bytes = new Uint8Array(totalLength);

  bytes[0] = encryptedMessage.VersionId;
  console.log("===== C1");
  console.log(encryptedMessage.c1);
  console.log(typeof encryptedMessage.c1);
  bytes.set(encryptedMessage.c1.toRawBytes(true), 1);

  bytes.set(encryptedMessage.c2, 1 + c1Length);

  encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
    const offset = 1 + c1Length + c2Length + 32 * i;
    bytes.set(block, offset);
  });

  return bytes;
}
