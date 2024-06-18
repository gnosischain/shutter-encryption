import { createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosisChiado } from "viem/chains";

const client = createWalletClient({
  chain: gnosisChiado,
  transport: http("https://rpc.chiadochain.net"),
});

// raw tx
// 0x02f8738227d80684b2d05e0084b2d05e088252089497d2eeb65da0c37dc0f43ff4691e521673efadfd872386f26fc1000080c080a00302ce489cad70b3a7c264d38a818f4d3ab9fcdbeff8827b780f3c99ffff0c7ca07d10274889060b00690b8cdd0040ff58ac5a9b128d96144a27d60b6c8b76cd2a

export async function prepareAndSignTransaction() {
  try {
    const request = await client.prepareTransactionRequest({
      account: privateKeyToAccount("0x0"),
      chain: gnosisChiado,
      to: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      value: BigInt("10000000000000000"),
    });

    const serializedTransaction = await client.signTransaction(request);
    console.log("Raw Transaction Hex:", serializedTransaction);
    return serializedTransaction;
  } catch (error) {
    console.error("Error preparing or signing the transaction:", error);
  }
}
