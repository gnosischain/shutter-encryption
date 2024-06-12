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
  console.log("IDENTITY", identity);

  const encryptedMessage = await encrypt(
    rawTxHex,
    identity,
    bls12_381.G2.ProjectivePoint.fromHex(eonKeyHex),
    //hexToBytes(`0x${sigmaHex}`, { size: 32 })
    sigmaHex
  );

  // ===============================================================
  // should be:
  // 02
  // 16BEA3B37C3A1698628BCDEB2DF3CD95F329D353A73237492162482E7E3DFDDF783BB3760A08F231C8349378C272A78618A7A703746CC00538D600E29BBC10BD0B6986C86BC75D99A1D4E55D6B6CD0407BF90614794116A3F75D1B212E35E38A07033C4A17996CC4FD3B487F488020B3EB7B656853D6B660E3C1950638CFE53D6AD7D6A98AD2D52C87D9A620EE97D02615CFFA0A4182D2F3617022E6CF86969DCE43FF991C68CECD9C1392C9EBDE4F3DD4F92A8C2F9FBE3017AF062AE8C864B73834A349678EF446BAE07E2AEFFC01054184AF00383438343834383438343834D5AE38A4349D2843A2A240D241CC3D4F2B0002279DDB8AFDABC5C2280DD1116908EE953789A7EEAE548D93B16858DAC875F2C33BE3BA12B56BA70ED1C6A780BAE916C2C6E2F5A5D3A8B95B766523B42B6498BEF762E50D4977E4F306BB9D37346DD5E8C2C17BC03CA27434C99A299093A56058246FEF60EAB134D7A62F628E32
}

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

  // BASE
  console.log("base");
  console.log(bls12_381.G1.ProjectivePoint.BASE.toHex());
  console.log("identity");
  console.log(identity.toRawBytes());
  console.log(identity.toHex());
  return identity;

  // N: 18D7F194D424CBC9A3AA9D999F46A72AC65549C35E7CA40775B8FE81D0E4D7A1CA95F9E895C88091AF271A646C83DB410A8F4D2796652E44C9134A013678DC5E61221F4821B038E69742E077B21A1A1B0B338AF0BF2E8C34378CC00D05DA665A
}

export async function encrypt(
  msg: string,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>, // ProjPointType<Fp2>,
  sigma: string
) {
  const r = await computeR(sigma, msg); // ok

  const c1 = await computeC1(r);
  //const c2 = await computeC2(sigma, r, identity, eonKey);
  // const c3 = computeC3(padAndSplit(msg), sigma); // Implement computeC3 based on your requirements

  // return {
  //   VersionId: 0x2,
  //   c1: c1,
  //   //c2: c2,
  //   // c3: c3,
  // };
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
  // const g2Generator = bls12_381.G2.ProjectivePoint.BASE;
  // // Convert r to little-endian bytes
  // const rLittleEndianBytes = bigintToLittleEndianBytes(r, 32);
  // // Convert little-endian bytes to bigint
  // const rLittleEndian = bytesToBigInt(rLittleEndianBytes.reverse());
  // // Validate rLittleEndian is within the expected range
  // if (rLittleEndian <= BigInt(0) || rLittleEndian >= bls12_381.G2.CURVE.n) {
  //   throw new Error(`Invalid value for rLittleEndian: ${rLittleEndian}`);
  // }
  // // Multiply the G2 generator by rLittleEndian
  // return g2Generator.multiply(rLittleEndian);
}

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

testEncrypt();
