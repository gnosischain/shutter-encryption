import { bytesToHex } from "viem";
import {
  encryptSimplified as encrypt,
  encodeEncryptedMessage,
} from "./encryptTxNobleCurves.js";
import tests from "./cryptotests_blst.json" assert { type: "json" };

type Test = {
  name: string;
  id: string;
  description: string;
  type: string;
  test_data: {
    message: string;
    eon_public_key: string;
    epoch_id: string;
    sigma: string;
    expected: string;
  };
};

function runTests() {
  for (const test of tests as Test[]) {
    if (test.type === "encryption") {
      console.log("TEST");
      console.log(test.name, test.id);
      console.log(
        test.test_data.message.slice(2),
        test.test_data.sigma.slice(2)
      );
      const encrypted = encrypt(
        test.test_data.message.slice(2),
        test.test_data.sigma.slice(2)
      );

      // console.log("encrypted");
      // console.log(encrypted);
      const encoded = bytesToHex(encodeEncryptedMessage(encrypted));
      // console.log(bytesToHex(encoded));
      console.log(encoded.toUpperCase());
      console.log(test.test_data.expected.toUpperCase());
      console.log(encoded === test.test_data.expected);
    }
  }
}

runTests();
