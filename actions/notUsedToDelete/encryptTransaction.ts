import { bls12_381 } from "@noble/curves/bls12-381";
// import { zip } from "lodash";
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
} from "viem";

import { ProjPointType } from "@noble/curves/abstract/weierstrass";

const blsSubgroupOrderBytes = [
  0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09,
  0xa1, 0xd8, 0x05, 0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff,
  0xff, 0xff, 0x00, 0x00, 0x00, 0x01,
];

const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

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

// public static void ComputeR(Bytes32 sigma, ReadOnlySpan<byte> msg, out UInt256 res)
// {
//     Span<byte> preimage = stackalloc byte[32 + msg.Length];
//     sigma.Unwrap().CopyTo(preimage);
//     msg.CopyTo(preimage[32..]);
//     Hash3(preimage, out res);
// }
function computeR(sigma: Uint8Array, msg: Uint8Array): bigint {
  const preimage = new Uint8Array(32 + msg.length);
  preimage.set(sigma);
  preimage.set(msg, 32);
  return hash3(preimage);
}

// public static G2 ComputeC1(UInt256 r)
// {
//     return G2.generator().mult(r.ToLittleEndian());
// }

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

// function bigintToLittleEndianBytes(bigint: bigint, length: number): Uint8Array {
//   const bytes = new Uint8Array(length);
//   for (let i = 0; i < length; i++) {
//     bytes[i] = Number(bigint & BigInt(0xff));
//     bigint >>= BigInt(8);
//   }
//   return bytes.reverse();
// }

// private static Bytes32 ComputeC2(Bytes32 sigma, UInt256 r, G1 identity, G2 eonKey)
// {
//     GT p = new(identity, eonKey);
//     GT preimage = ShutterCrypto.GTExp(p, r);
//     Bytes32 key = ShutterCrypto.Hash2(preimage);
//     return ShutterCrypto.XorBlocks(sigma, key);
// }
function computeC2(
  sigma: Uint8Array,
  r: bigint,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>
) {
  // console.log("identity", identity.toHex()); // Identity OK
  // console.log("eonKey", eonKey.toHex()); // EonKey OK
  const p = bls12_381.pairing(identity, eonKey, false);

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
  return xorBlocks(sigma, key); // Implement xorBlocks based on your requirements
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

// function computeC3(
//   messageBlocks: Uint8Array[],
//   sigma: Uint8Array
// ): Uint8Array[] {
//   const keys = computeBlockKeys(sigma, messageBlocks.length);
//   // return zip(keys, messageBlocks).map(([key, block]) => {
//   //   if (key === undefined || block === undefined) {
//   //     throw new Error("Key or block is undefined");
//   //   }
//   //   return xorBlocks(key, block);
//   // });
// }

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

// public static Bytes32 Hash2(GT p)
// {
//     Span<byte> preimage = stackalloc byte[577];
//     preimage[0] = 0x2;
//     p.final_exp().to_bendian().CopyTo(preimage[1..]);
//     return HashBytesToBlock(preimage);
// }
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

  // to delete
  const res = keccak256(preimageTest, "bytes"); // this works

  return keccak256(preimageTest, "bytes");
}

// public static void Hash3(ReadOnlySpan<byte> bytes, out UInt256 res)
// {
//     byte[] preimage = new byte[bytes.Length + 1];
//     preimage[0] = 0x3;
//     bytes.CopyTo(preimage.AsSpan()[1..]);
//     Span<byte> hash = Keccak.Compute(preimage).Bytes;
//     UInt256.Mod(new UInt256(hash), BlsSubgroupOrder, out res);
// }
function hash3(bytes: Uint8Array): bigint {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x3;
  preimage.set(bytes, 1);
  const hash = keccak256(preimage, "bytes");
  const bigIntHash = bytesToBigInt(hash.reverse());
  const result = bigIntHash % blsSubgroupOrder;

  return result;
}

// public static Bytes32 Hash4(ReadOnlySpan<byte> bytes)
// {
//     byte[] preimage = new byte[bytes.Length + 1];
//     preimage[0] = 0x4;
//     bytes.CopyTo(preimage.AsSpan()[1..]);
//     Span<byte> hash = Keccak.Compute(preimage).Bytes;
//     return new(hash);
// }
function hash4(bytes: Uint8Array): Uint8Array {
  const preimage = new Uint8Array(bytes.length + 1);
  preimage[0] = 0x4;
  preimage.set(bytes, 1);
  const hash = keccak256(preimage, "bytes");
  return hash;
}

function fp12ToBigEndianBytes(fp12: any): Uint8Array {
  const bytes = bls12_381.fields.Fp12.toBytes(fp12);

  return bytes.reverse();

  // const components: bigint[] = [];
  // // Recursive function to collect all bigint components
  // function collectComponents(obj: any) {
  //   if (typeof obj === "bigint") {
  //     components.push(obj); // Collect the bigint
  //   } else if (typeof obj === "object" && obj !== null) {
  //     // Recurse into each property if it's an object
  //     for (const key of Object.keys(obj)) {
  //       collectComponents(obj[key]);
  //     }
  //   }
  // }
  // // Start collecting components from the fp12 object
  // collectComponents(fp12);
  // // Convert each bigint to a big-endian byte array and concatenate them
  // const byteArrays = components.map((bigint) =>
  //   bigintToBigEndianBytes(bigint, 48)
  // ); // Assuming 48 bytes per component
  // const totalLength = byteArrays.reduce((acc, val) => acc + val.length, 0);
  // const result = new Uint8Array(totalLength);
  // let offset = 0;
  // for (const bytes of byteArrays) {
  //   result.set(bytes, offset);
  //   offset += bytes.length;
  // }
  // return result;
}

// Helper function to convert a bigint to a big-endian byte array
function bigintToBigEndianBytes(bigint: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[length - i - 1] = Number(bigint & BigInt(0xff));
    bigint >>= BigInt(8);
  }
  return bytes;
}

// internal static EncryptedMessage Encrypt(ReadOnlySpan<byte> msg, G1 identity, G2 eonKey, Bytes32 sigma)
// {
//     UInt256 r;
//     ShutterCrypto.ComputeR(sigma, msg, out r);

//     EncryptedMessage c = new()
//     {
//         VersionId = 0x2,
//         c1 = ShutterCrypto.ComputeC1(r),
//         c2 = ComputeC2(sigma, r, identity, eonKey),
//         c3 = ComputeC3(PadAndSplit(msg), sigma)
//     };
//     return c;
// }
export async function encrypt(
  msg: Uint8Array,
  identity: ProjPointType<bigint>,
  eonKey: ProjPointType<any>, // ProjPointType<Fp2>,
  sigma: Uint8Array
) {
  const r = await computeR(sigma, msg);
  const c1 = await computeC1(r);
  const c2 = await computeC2(sigma, r, identity, eonKey);
  // const c3 = computeC3(padAndSplit(msg), sigma); // Implement computeC3 based on your requirements

  return {
    VersionId: 0x2,
    c1: c1,
    c2: c2,
    // c3: c3,
  };
}

// public static G1 ComputeIdentity(Bytes32 identityPrefix, Address sender)
// {
//     Span<byte> preimage = stackalloc byte[52];
//     identityPrefix.Unwrap().CopyTo(preimage);
//     sender.Bytes.CopyTo(preimage[32..]);

//     return ComputeIdentity(preimage);
// }
// public static G1 ComputeIdentity(ReadOnlySpan<byte> bytes)
// {
//     byte[] preimage = new byte[bytes.Length + 1];
//     preimage[0] = 0x1;
//     bytes.CopyTo(preimage.AsSpan()[1..]);

//     // todo: change once shutter updates
//     // return new G1().hash_to(preimage);

//     Span<byte> hash = Keccak.Compute(preimage).Bytes;
//     hash.Reverse();
//     return G1.generator().mult(hash.ToArray());
// }

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
// public void Output_encrypted_transaction(string rawTxHex, string senderAddress, string identityPrefixHex, string eonKeyHex, string sigmaHex)
// {
//     byte[] rawTx = Convert.FromHexString(rawTxHex);

//     Transaction transaction = Rlp.Decode<Transaction>(new Rlp(rawTx));
//     transaction.SenderAddress = new EthereumEcdsa(BlockchainIds.Chiado, new NUnitLogManager()).RecoverAddress(transaction, true);
//     TestContext.WriteLine(transaction.ToShortString());

//     Bytes32 identityPrefix = new(Convert.FromHexString(identityPrefixHex).AsSpan());
//     G1 identity = ShutterCrypto.ComputeIdentity(identityPrefix, new(senderAddress));
//     G2 eonKey = new(Convert.FromHexString(eonKeyHex));
//     Bytes32 sigma = new(Convert.FromHexString(sigmaHex).AsSpan());

//     EncryptedMessage c = Encrypt(rawTx, identity, eonKey, sigma);

//     byte[] encoded = EncodeEncryptedMessage(c);
//     TestContext.WriteLine("encrypted tx: " + Convert.ToHexString(encoded));
//     // uncomment this to output
//     // Assert.That(false);
// }

export async function testEncrypt() {
  // rawTxHex, string senderAddress, string identityPrefixHex, string eonKeyHex, string sigmaHex
  const rawTxHex =
    "f869820248849502f900825208943834a349678ef446bae07e2aeffc01054184af008203e880824fd3a001e44318458b1f279bf81aef969df1b9991944bf8b9d16fd1799ed5b0a7986faa058f572cce63aaff3326df9c902d338b0c416c8fb93109446d6aadd5a65d3d115";
  const senderAddress = "3834a349678eF446baE07e2AefFC01054184af00";
  const identityPrefixHex =
    "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";

  // const identityPrefixBytes = numberToBytes(
  //   BigInt(
  //     "23619571968023848331766184902370628094969430394214807609768563618282746360888"
  //   )
  // );

  const eonKeyHex =
    "B068AD1BE382009AC2DCE123EC62DCA8337D6B93B909B3EE52E31CB9E4098D1B56D596BF3C08166C7B46CB3AA85C23381380055AB9F1A87786F2508F3E4CE5CAA5ABCDAE0A80141EE8CCC3626311E0A53BE5D873FA964FD85AD56771F2984579";
  const sigmaHex =
    "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834";

  const txBytes = hexToBytes(`0x${rawTxHex}`);

  // const identity = computeIdentity(
  //   hexToBytes(`0x${identityPrefixHex}`, { size: 32 }),
  //   // identityPrefixBytes,
  //   hexToBytes(`0x${senderAddress}`)
  // );

  const identity = computeIdentity2(identityPrefixHex, senderAddress);

  console.log("IDENTITY", identity);

  const encryptedMessage = await encrypt(
    txBytes,
    identity,
    bls12_381.G2.ProjectivePoint.fromHex(eonKeyHex),
    hexToBytes(`0x${sigmaHex}`, { size: 32 })
  );

  // console.log(encryptedMessage);

  const encoded: Uint8Array = encodeEncryptedMessage(encryptedMessage);

  const encryptedTx = bytesToHex(encoded);

  console.log("encrypted TX");
  console.log(encryptedTx.toUpperCase());

  // ===============================================================
  // should be:
  // 02
  // c1 B695A53BC2AB868E02786730030F78FA4CD3A24169966BCE28D6F2B2A73A8DAF9C1C57890

  // CA24680DE84A175F67E4DD00E0FBC7531A017EBD4183E2C66B2726AA16C393A0D44BE40803EC1

  // c3 AFBE9F76BB0FD610E81E64760420008769E81799CB
  // 13EF2CFF94E7F4D809F4BC8B38599F940D25AC209A9661ED90A71562F3EC2CF1

  // 8258DBDFF56ACC2F1A7C4E978C515A288BE09451EEE79B47E551F30F
  // 5B632C18FD43434574E0101FF74525CA254C1288AFB615B491A00452BD565F40DED22A8138F684DE2D21C26D2B48A439C3200FB4A172D76DBDE1228542FF3ABBF4EC09F1BFFAE3861F6CD187269FD1983CC9BB25122E37A2C21C33AD9590865B54EAA0B5
  // ===============================================================
  //

  // 0X0
  // 2B695A53BC2AB868E02786730030F78FA4CD3A24169966BCE28D6F2B2A73A8DAF9C1C57890
  // CA24680DE84A175F67E4DD00E0FBC7531A017EBD4183E2C66B2726AA16C393A0D44BE40803EC1
  // AFBE9F76BB0FD610E81E64760420008769E81799CB
  // 13EF2CFF94E7F4D809F4BC8B38599F940D25AC209A9661ED90A71562F3EC2CF1

  // 0X02
  // B695A53BC2AB868E02786730030F78FA4CD3A24169966BCE28D6F2B2A73A8DAF9C1C57890
  // CA24680DE84A175F67E4DD00E0FBC7531A017EBD4183E2C66B2726AA16C393A0D44BE40803EC1

  // AFBE9F76BB0FD610E81E64760420008769E81799CB
  // 181DD14B69A06F080C4946E419745E7156852D0B6691B4069F39B25367A9398C
}

// internal static byte[] EncodeEncryptedMessage(EncryptedMessage encryptedMessage)
// {
//     byte[] bytes = new byte[1 + 96 + 32 + (encryptedMessage.c3.Count() * 32)];

//     bytes[0] = encryptedMessage.VersionId;
//     encryptedMessage.c1.compress().CopyTo(bytes.AsSpan()[1..]);
//     encryptedMessage.c2.Unwrap().CopyTo(bytes.AsSpan()[(1 + 96)..]);

//     foreach ((Bytes32 block, int i) in encryptedMessage.c3.WithIndex())
//     {
//         int offset = 1 + 96 + 32 + (32 * i);
//         block.Unwrap().CopyTo(bytes.AsSpan()[offset..]);
//     }

//     return bytes;
// }
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
  // bytes.set(encryptedMessage.c1.toRawBytes(true), 1);
  bytes.set(encryptedMessage.c1.toRawBytes(false), 1);

  bytes.set(encryptedMessage.c2, 1 + c1Length);

  encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
    const offset = 1 + c1Length + c2Length + 32 * i;
    bytes.set(block, offset);
  });

  return bytes;
}

testEncrypt();