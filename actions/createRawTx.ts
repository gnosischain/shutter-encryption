import { createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosisChiado } from "viem/chains";

const client = createWalletClient({
  chain: gnosisChiado,
  transport: http("https://rpc.chiadochain.net"),
});

// raw tx
// 0x02f8738227d80184b6fc7b7984b6fc7b818252089497d2eeb65da0c37dc0f43ff4691e521673efadfd872386f26fc1000080c080a09f618e2973dddaa016922799340758cd8b68ca3f813d4dab42b7d3fa5134e331a076b467d0853e6ff092cf1aa5134fbf940673b45b735944fdd0b0ea8fcd2e23df

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
