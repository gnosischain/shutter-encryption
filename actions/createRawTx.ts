import { createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosisChiado } from "viem/chains";

const client = createWalletClient({
  chain: gnosisChiado,
  transport: http("https://rpc.chiadochain.net"),
});

// raw tx
// 0x02f8718227d88084b2d05e0084b2d05e088252089497d2eeb65da0c37dc0f43ff4691e521673efadfd85174876e80080c001a0791a93be3322b31d22e2e818b784bb9ae7619ee9c1eb2b39a51551626d1b642ea038206a93bc2e87e81505f7c7aab3af272d42ebde98bad8810b01df89814378d4

export async function prepareAndSignTransaction() {
  try {
    const request = await client.prepareTransactionRequest({
      account: privateKeyToAccount("0x0"),
      chain: gnosisChiado,
      to: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      value: BigInt(100000000000),
    });

    const serializedTransaction = await client.signTransaction(request);
    console.log("Raw Transaction Hex:", serializedTransaction);
    return serializedTransaction;
  } catch (error) {
    console.error("Error preparing or signing the transaction:", error);
  }
}
