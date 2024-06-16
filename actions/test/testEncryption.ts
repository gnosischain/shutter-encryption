import { encryptData } from "../encryptTxNobleCurvesFullBlst.js";
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

async function runTests() {
  console.log("TEST");
  for (const test of tests as Test[]) {
    if (test.type === "encryption") {
      console.log(test.name, test.id);

      const encryptedMessage: `0x${string}` = await encryptData(
        test.test_data.message as `0x${string}`,
        test.test_data.epoch_id as `0x${string}`,
        test.test_data.eon_public_key as `0x${string}`,
        test.test_data.sigma as `0x${string}`
      );

      // console.log("encryptedMessage", encryptedMessage);
      console.log(encryptedMessage === test.test_data.expected);
    }
  }
}

runTests();
