import { bls12_381 } from "@noble/curves/bls12-381";
import { ProjPointType } from "@noble/curves/abstract/weierstrass";
import {
  stringToBytes,
  hexToBytes,
  toBytes,
  type Address,
  keccak256,
  bytesToBigInt,
  bytesToHex,
  numberToBytes,
  numberToHex,
  hexToBigInt,
} from "viem";
import pkg from "lodash";
const { zip } = pkg;

const blsSubgroupOrderBytes = [
  0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09,
  0xa1, 0xd8, 0x05, 0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff,
  0xff, 0xff, 0x00, 0x00, 0x00, 0x01,
];
const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

export async function testEncrypt() {
  const rawTxHex =
    "f869820248849502f900825208943834a349678ef446bae07e2aeffc01054184af008203e880824fd3a001e44318458b1f279bf81aef969df1b9991944bf8b9d16fd1799ed5b0a7986faa058f572cce63aaff3326df9c902d338b0c416c8fb93109446d6aadd5a65d3d115";
  const senderAddress = "3834a349678eF446baE07e2AefFC01054184af00";
  const identityPrefixHex =
    "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";
  const eonKeyHex =
    "B068AD1BE382009AC2DCE123EC62DCA8337D6B93B909B3EE52E31CB9E4098D1B56D596BF3C08166C7B46CB3AA85C23381380055AB9F1A87786F2508F3E4CE5CAA5ABCDAE0A80141EE8CCC3626311E0A53BE5D873FA964FD85AD56771F2984579";
  const sigmaHex =
    "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";

  const identity = computeIdentity(identityPrefixHex, senderAddress);

  const encryptedMessage = await encrypt(
    rawTxHex,
    identity,
    bls12_381.G2.ProjectivePoint.fromHex(eonKeyHex),
    sigmaHex
  );

  const encoded: Uint8Array = encodeEncryptedMessage(encryptedMessage);

  const encryptedTx = bytesToHex(encoded);

  console.log("encrypted TX");
  console.log(encryptedTx.toUpperCase());

  // ===============================================================
  // should be:
  // 02
  // c1: ok
  // 16BEA3B37C3A1698628BCDEB2DF3CD95F329D353A73237492162482E7E3DFDDF783BB3760A08F231C8349378C272A78618A7A703746CC00538D600E29BBC10BD0B6986C86BC75D99A1D4E55D6B6CD0407BF90614794116A3F75D1B212E35E38A07033C4A17996CC4FD3B487F488020B3EB7B656853D6B660E3C1950638CFE53D6AD7D6A98AD2D52C87D9A620EE97D02615CFFA0A4182D2F3617022E6CF86969DCE43FF991C68CECD9C1392C9EBDE4F3DD4F92A8C2F9FBE3017AF062AE8C864B7
  // c2: ok
  // 3834A349678EF446BAE07E2AEFFC01054184AF00383438343834383438343834
  // c3:
  // D5AE38A4349D2843A2A240D241CC3D4F2B0002279DDB8AFDABC5C2280DD1116908EE953789A7EEAE548D93B16858DAC875F2C33BE3BA12B56BA70ED1C6A780BAE916C2C6E2F5A5D3A8B95B766523B42B6498BEF762E50D4977E4F306BB9D37346DD5E8C2C17BC03CA27434C99A299093A56058246FEF60EAB134D7A62F628E32
}

export function encrypt(
  msg: string,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>, // ProjPointType<Fp2>,
  sigma: string
) {
  const r = computeR(sigma, msg); // ok

  const c1 = computeC1(r);
  const c2 = computeC2(sigma, r, identity, eonKey); // ok
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
//======================================

export function encodeEncryptedMessage(
  encryptedMessage: any // EncryptedMessage
): Uint8Array {
  const c1Length = 192;
  const c2Length = 32;
  const c3Length = encryptedMessage.c3.length * 32;

  const totalLength = 1 + c1Length + c2Length + c3Length;
  const bytes = new Uint8Array(totalLength);

  bytes[0] = encryptedMessage.VersionId;
  // console.log("===== C1");
  // console.log(encryptedMessage.c1);
  // console.log(typeof encryptedMessage.c1);
  // bytes.set(encryptedMessage.c1.toRawBytes(false), 1);
  // bytes.set(encryptedMessage.c1.toRawBytes(true), 1);

  bytes.set(encryptedMessage.c2, 1 + c1Length);

  // encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
  //   const offset = 1 + c1Length + c2Length + 32 * i;
  //   bytes.set(block, offset);
  // });

  return bytes;
}

//======================================
function computeIdentity(
  identityPrefixHex: string,
  senderAddress: string
): any {
  //  from nethermmind:
  //  hash before reverse
  //  097AAE4DFD3D5445FE9A992BD361A7355B3A2C38BBC58EE77B280235652DD9F0
  //  hash after reverse
  //  F0D92D653502287BE78EC5BB382C3A5B35A761D32B999AFE45543DFD4DAE7A09
  const preimage = "0x1" + identityPrefixHex + senderAddress;
  const hash = keccak256(preimage as `0x${string}`);
  // console.log("hash before reverse");
  // console.log(hash.toUpperCase());
  // 0X097AAE4DFD3D5445FE9A992BD361A7355B3A2C38BBC58EE77B280235652DD9F0
  const hashReversed = hexToBytes(hash).reverse(); // ok
  // console.log("hash reversed");
  // console.log(bytesToHex(hashReversed).toUpperCase()); // ok
  // 0XF0D92D653502287BE78EC5BB382C3A5B35A761D32B999AFE45543DFD4DAE7A09

  const hashReversedBigInt = bytesToBigInt(hashReversed) % bls12_381.G1.CURVE.n;
  const identity =
    bls12_381.G1.ProjectivePoint.BASE.multiply(hashReversedBigInt);

  // BASE to check
  // console.log("base");
  // console.log(bls12_381.G1.ProjectivePoint.BASE.toHex());
  // console.log("identity");
  // console.log(identity.toRawBytes());
  // console.log(identity.toHex());
  return identity;

  // N: 18D7F194D424CBC9A3AA9D999F46A72AC65549C35E7CA40775B8FE81D0E4D7A1CA95F9E895C88091AF271A646C83DB410A8F4D2796652E44C9134A013678DC5E61221F4821B038E69742E077B21A1A1B0B338AF0BF2E8C34378CC00D05DA665A
}

function computeR(sigmaHex: string, msgHex: string): bigint {
  const preimage = sigmaHex + msgHex;

  // in Netethermind
  // 3834A349678EF446BAE07E2AEFFC01054184AF00383438343834383438343834F869820248849502F900825208943834A349678EF446BAE07E2AEFFC01054184AF008203E880824FD3A001E44318458B1F279BF81AEF969DF1B9991944BF8B9D16FD1799ED5B0A7986FAA058F572CCE63AAFF3326DF9C902D338B0C416C8FB93109446D6AADD5A65D3D115

  // console.log("preimage in computeR");
  // console.log(preimage.toUpperCase());
  // 3834A349678EF446BAE07E2AEFFC01054184AF00383438343834383438343834F869820248849502F900825208943834A349678EF446BAE07E2AEFFC01054184AF008203E880824FD3A001E44318458B1F279BF81AEF969DF1B9991944BF8B9D16FD1799ED5B0A7986FAA058F572CCE63AAFF3326DF9C902D338B0C416C8FB93109446D6AADD5A65D3D115
  return hash3(preimage);
}

// public static G2 ComputeC1(UInt256 r)
// {
//     return G2.generator().mult(r.ToLittleEndian());
// }
function computeC1(r: bigint) {
  const rLittleEndianBytes = bigintToLittleEndianBytes(r, 32);
  const rLittleEndian = bytesToBigInt(rLittleEndianBytes.reverse());
  // Validate rLittleEndian is within the expected range
  if (rLittleEndian <= BigInt(0) || rLittleEndian >= bls12_381.G2.CURVE.n) {
    throw new Error(`Invalid value for rLittleEndian: ${rLittleEndian}`);
  }
  const g2Generator = bls12_381.G2.ProjectivePoint.BASE;
  return g2Generator.multiply(rLittleEndian);
}

function computeC2(
  sigma: string,
  r: bigint,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>
) {
  // console.log("identity", identity.toHex()); // Identity OK
  // console.log("eonKey", eonKey.toHex()); // EonKey OK
  const p = bls12_381.pairing(identity, eonKey, true);
  console.log(p.c0);

  // type PairingType = ReturnType<typeof bls12_381.pairing>;

  // console.log(PairingType);

  // just check
  // const newP = fp12ToBigEndianBytes(p);
  // console.log("newP", bytesToHex(newP));

  const pBytes = bls12_381.fields.Fp12.toBytes(p);
  // console.log("pBytes", pBytes);
  const hexBytes = bytesToHex(pBytes);
  // console.log("hexBytes P", hexBytes);
  const preimage = GTExp(p, r);

  // console.log("preimage", preimage.toHex());
  const key = hash2(preimage); // Implement hash2 based on your requirements
  console.log("key", bytesToHex(key));
  return xorBlocks(hexToBytes(`0x${sigma}`), key); // Implement xorBlocks based on your requirements

  // 5ED6335DCAB41B2442205C3B0D7083CBB8944E9BA183FDCC4075CC37119C9CFE ?
}

// private static IEnumerable<Bytes32> ComputeC3(IEnumerable<Bytes32> messageBlocks, Bytes32 sigma)
// {
//     IEnumerable<Bytes32> keys = ShutterCrypto.ComputeBlockKeys(sigma, messageBlocks.Count());
//     return Enumerable.Zip(keys, messageBlocks, ShutterCrypto.XorBlocks);
// }
function computeC3( // ok
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

function hash2(p: any): Uint8Array {
  // Perform the final exponentiation and convert to big-endian bytes
  const finalExp = (bls12_381.fields.Fp12 as any).finalExponentiate(p);

  // console.log("===final checkk");
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

  // console.log("===preimage", bytesToHex(preimageTest));

  // to delete
  const res = keccak256(preimageTest, "bytes"); // this works

  return keccak256(preimageTest, "bytes");
}

// ok
function hash3(bytesHex: string): bigint {
  const preimage = hexToBytes(("0x3" + bytesHex) as `0x${string}`);
  const hash = keccak256(preimage, "bytes");

  // console.log("hash", bytesToHex(hash).toUpperCase());
  // Nethermind: ED3A728821C1CA008B6C7D9CA0FAB48125483260FF3818A1225A6553C43C77FE
  // JS: 0XED3A728821C1CA008B6C7D9CA0FAB48125483260FF3818A1225A6553C43C77FE

  const bigIntHash = bytesToBigInt(hash);
  // console.log("bigint", bigIntHash);
  // Nethermind: 107301412713182587017209173950352985551822634162401877692796462593683356415998
  // JS: 107301412713182587017209173950352985551822634162401877692796462593683356415998n

  // console.log("blsSubgroupOrder", blsSubgroupOrder);
  // 52435875175126190479447740508185965837690552500527637822603658699938581184513
  // 52435875175126190479447740508185965837690552500527637822603658699938581184513n

  const result = bigIntHash % blsSubgroupOrder;
  // console.log("result", result);
  // N: 2429662362930206058313692933981053876441529161346602047589145193806194046972
  // TS: 2429662362930206058313692933981053876441529161346602047589145193806194046972n

  return result; // ok
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

// ok
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

// ok
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

type Fp12Type = ReturnType<typeof bls12_381.pairing>;

function GTExp(x: Fp12Type, exp: bigint): Fp12Type {
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

//======================================
testEncrypt();
