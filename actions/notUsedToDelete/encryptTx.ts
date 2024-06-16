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

// import { SecretKey, verify } from "@chainsafe/blst";
import blst from "@chainsafe/blst";
console.log(blst);

// import bls from "@chainsafe/bls/blst-native";
// import blstTs from "@chainsafe/blst";
import { SecretKey, PublicKey, Signature } from "@chainsafe/blst";
// import { P1 } from "@chainsafe/blst";

// using G1 = Bls.P1;
// using G2 = Bls.P2;
// using GT = Bls.PT;

// [Test]
//     [TestCase(
//         "f869820248849502f900825208943834a349678ef446bae07e2aeffc01054184af008203e880824fd3a001e44318458b1f279bf81aef969df1b9991944bf8b9d16fd1799ed5b0a7986faa058f572cce63aaff3326df9c902d338b0c416c8fb93109446d6aadd5a65d3d115",
//         "3834a349678eF446baE07e2AefFC01054184af00",
//         "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834",
//         "B068AD1BE382009AC2DCE123EC62DCA8337D6B93B909B3EE52E31CB9E4098D1B56D596BF3C08166C7B46CB3AA85C23381380055AB9F1A87786F2508F3E4CE5CAA5ABCDAE0A80141EE8CCC3626311E0A53BE5D873FA964FD85AD56771F2984579",
//         "3834a349678eF446baE07e2AefFC01054184af00383438343834383438343834",
//         "02B695A53BC2AB868E02786730030F78FA4CD3A24169966BCE28D6F2B2A73A8DAF9C1C57890CA24680DE84A175F67E4DD00E0FBC7531A017EBD4183E2C66B2726AA16C393A0D44BE40803EC1AFBE9F76BB0FD610E81E64760420008769E81799CB13EF2CFF94E7F4D809F4BC8B38599F940D25AC209A9661ED90A71562F3EC2CF18258DBDFF56ACC2F1A7C4E978C515A288BE09451EEE79B47E551F30F5B632C18FD43434574E0101FF74525CA254C1288AFB615B491A00452BD565F40DED22A8138F684DE2D21C26D2B48A439C3200FB4A172D76DBDE1228542FF3ABBF4EC09F1BFFAE3861F6CD187269FD1983CC9BB25122E37A2C21C33AD9590865B54EAA0B5"
//     )]
//     public void Can_encrypt_transaction(string rawTxHex, string senderAddress, string identityPrefixHex, string eonKeyHex, string sigmaHex, string expectedHex)
//     {
//         byte[] rawTx = Convert.FromHexString(rawTxHex);
//         byte[] expected = Convert.FromHexString(expectedHex);

//         Transaction transaction = Rlp.Decode<Transaction>(new Rlp(rawTx));
//         transaction.SenderAddress = new EthereumEcdsa(BlockchainIds.Chiado, new NUnitLogManager()).RecoverAddress(transaction, true);
//         TestContext.WriteLine(transaction.ToShortString());

//         Bytes32 identityPrefix = new(Convert.FromHexString(identityPrefixHex).AsSpan());
//         G1 identity = ShutterCrypto.ComputeIdentity(identityPrefix, new(senderAddress));
//         G2 eonKey = new(Convert.FromHexString(eonKeyHex));
//         Bytes32 sigma = new(Convert.FromHexString(sigmaHex).AsSpan());

//         EncryptedMessage c = Encrypt(rawTx, identity, eonKey, sigma);

//         byte[] encoded = EncodeEncryptedMessage(c);
//         TestContext.WriteLine("encrypted tx: " + Convert.ToHexString(encoded));
//         Assert.That(encoded, Is.EqualTo(expected));
//     }

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

  const expectedHex =
    "02B695A53BC2AB868E02786730030F78FA4CD3A24169966BCE28D6F2B2A73A8DAF9C1C57890CA24680DE84A175F67E4DD00E0FBC7531A017EBD4183E2C66B2726AA16C393A0D44BE40803EC1AFBE9F76BB0FD610E81E64760420008769E81799CB13EF2CFF94E7F4D809F4BC8B38599F940D25AC209A9661ED90A71562F3EC2CF18258DBDFF56ACC2F1A7C4E978C515A288BE09451EEE79B47E551F30F5B632C18FD43434574E0101FF74525CA254C1288AFB615B491A00452BD565F40DED22A8138F684DE2D21C26D2B48A439C3200FB4A172D76DBDE1228542FF3ABBF4EC09F1BFFAE3861F6CD187269FD1983CC9BB25122E37A2C21C33AD9590865B54EAA0B5";

  const txBytes = hexToBytes(`0x${rawTxHex}`);

  const identity = computeIdentity(identityPrefixHex, senderAddress);

  console.log("IDENTITY", identity);

  // const encryptedMessage = await encrypt(
  //   txBytes,
  //   identity,
  //   bls12_381.G2.ProjectivePoint.fromHex(eonKeyHex),
  //   hexToBytes(`0x${sigmaHex}`, { size: 32 })
  // );

  // console.log(encryptedMessage);

  // const encoded: Uint8Array = encodeEncryptedMessage(encryptedMessage);

  // const encryptedTx = bytesToHex(encoded);

  // console.log("encrypted TX");
  // console.log(encryptedTx.toUpperCase());
}

// public static G1 ComputeIdentity(Bytes32 identityPrefix, Address sender)
// {
//     Span<byte> preimage = stackalloc byte[52];
//     identityPrefix.Unwrap().CopyTo(preimage);
//     sender.Bytes.CopyTo(preimage[32..]);

//     return ComputeIdentity(preimage);
// }
function computeIdentity(identityPrefixHex: string, senderAddress: string) {
  const preimage = identityPrefixHex + senderAddress;
  // console.log("preimage", preimage);
  return computeIdentityFromPreimage(preimage);
}

// // Hash1 in spec
//     public static G1 ComputeIdentity(ReadOnlySpan<byte> bytes)
//     {
//         byte[] preimage = new byte[bytes.Length + 1];
//         preimage[0] = 0x1;
//         bytes.CopyTo(preimage.AsSpan()[1..]);

//         // todo: change once shutter updates
//         // return new G1().hash_to(preimage);

//         Span<byte> hash = Keccak.Compute(preimage).Bytes;
//         hash.Reverse();
//         return G1.generator().mult(hash.ToArray());
//     }
function computeIdentityFromPreimage(bytesString: string): any {
  const preimage = "0x1" + bytesString;
  const hash = keccak256(preimage as `0x${string}`);
  // console.log("hash before reverse");
  // console.log(hash.toUpperCase());

  //  from nethermmind:
  //  hash before reverse
  //  097AAE4DFD3D5445FE9A992BD361A7355B3A2C38BBC58EE77B280235652DD9F0
  //  hash after reverse
  //  F0D92D653502287BE78EC5BB382C3A5B35A761D32B999AFE45543DFD4DAE7A09

  const hashReversed = hexToBytes(hash).reverse(); // ok
  // console.log("hash reversed");
  // console.log(bytesToHex(hashReversed).toUpperCase()); // ok

  const sk = SecretKey.fromKeygen(hashReversed);
  const pk = sk.toPublicKey();
  console.log(pk);
  console.log("pk", pk.toHex(), pk.serialize());

  return pk;
}

testEncrypt();
