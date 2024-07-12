import { useEffect, useState, useMemo, useCallback } from 'react';
import { Input } from '@nextui-org/react';
import { usePrepareTransactionRequest, type UsePrepareTransactionRequestReturnType } from 'wagmi';
import { type Hex, parseEther } from 'viem';
import { useSwitchChain } from 'wagmi';
import { CHAINS, nativeXDaiToken } from '@/constants/chains';
import { mapChainsToOptions, mapTokensToOptions, mapTokenToOption } from '@/utils/mappers';
import { Select } from '@/components/Select';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { encodeDataForTransfer } from '@/utils/eth';


import { SubmitButton } from './SubmitButton';

const mappedChains = mapChainsToOptions(CHAINS);
const defaultToken = mapTokenToOption(CHAINS[0].tokens[0]);

interface TransferFormProps {
  submit: (tx: UsePrepareTransactionRequestReturnType) => void,
  status: number,
  isSubmitDisabled: boolean,
}

export const TransferForm = ({ submit, status, isSubmitDisabled }: TransferFormProps) => {
  const { switchChain } = useSwitchChain();
  const [chain, setChain] = useState(mappedChains[0]);
  const [token, setToken] = useState(defaultToken);
  const [amount, setAmount] = useState("0");
  const [to, setTo] = useState('');

  const { balance } = useTokenBalance({
    tokenAddress: token?.address,
    chainId: chain.chainId,
    enabled: Boolean(token?.address),
  });

  useEffect(() => {
    if (chain && chain.tokens.length > 0) {
      setToken(mapTokenToOption(chain.tokens[0]));
    }
  }, [chain]);

  useEffect(() => {
    if (switchChain && chain) {
      switchChain(chain.id);
      console.log(chain.id);
    }
  }, [chain, switchChain]);


  const mappedTokens = useMemo(() => chain && mapTokensToOptions(chain.tokens), [chain]);

  const data = useMemo(() => {
    if (token?.address === nativeXDaiToken.address || !balance) {
      return '0x' as Hex;
    }

    return encodeDataForTransfer(to, Number(amount), balance.decimals) as Hex;
  }, [token, balance, to, amount]);

  const result = usePrepareTransactionRequest({
    data,
    chainId: chain.id,
    to: token?.address === nativeXDaiToken.address ? to : token?.address,
    value: token?.address === nativeXDaiToken.address ? parseEther(amount.toString()) : 0 as unknown as bigint,
  });

  const onSubmit = useCallback(() => {
    submit(result);
  }, [submit, result]);

  return (
    <div>
      <div className="my-4">
        <Select
          items={mappedChains}
          selectedItem={chain}
          handleChange={setChain}
          title="Chain"
        />
      </div>

      <div className="my-4">
        <Select
          items={mappedTokens}
          selectedItem={token}
          handleChange={setToken}
          title="Token"
        />
      </div>

      <div>
        <Input
          type="number"
          step="0.0001"
          label="Amount"
          variant="bordered"
          value={amount}
          onChange={useCallback((e: any) => setAmount(e.target.value), [])}
        />

        <div
          className="text-xs text-default-500 hover:cursor-pointer"
          onClick={useCallback(() => setAmount(balance?.formatted || "0"), [balance])}
        >
          Balance: {balance ? balance.formatted : '0'}
        </div>
      </div>

      <Input
        label="To"
        placeholder="0x7d5c..."
        className="my-2"
        variant="bordered"
        value={to}
        onChange={useCallback((e: any) => setTo(e.target.value), [])}
      />

      <SubmitButton isSubmitDisabled={isSubmitDisabled || !result.data?.nonce} status={status} transactionCount={result.data?.nonce} submit={onSubmit} />
    </div>
  );
};
