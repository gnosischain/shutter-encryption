import { utils } from 'ethers';

const functionSignature = 'transfer(address,uint256)';
const functionSelector = utils.id(functionSignature).slice(0, 10);

export const encodeDataForTransfer = (recipientAddress: string, amount: number, decimals: number) => {
  const tokenAmount = utils.parseUnits(amount.toString(), decimals);

  const params = utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    [recipientAddress, tokenAmount]
  );

  return functionSelector + params.slice(2);
};
