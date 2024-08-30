import { useMemo } from 'react';
import { Card, CardBody, Divider, Link, Spinner } from '@nextui-org/react';
import { useChainId } from 'wagmi';

import { truncateNumberSymbols } from '@/utils/eth';
import { CHAINS_MAP } from '@/constants/chains';

interface ProgressInfoCardProps {
  status: number;
  submittedTxHash?: string;
  originalTx?: string;
}

export const ProgressInfoCard = ({ status, submittedTxHash = '' }: ProgressInfoCardProps) => {
  const chainId = useChainId();
  const txLink = useMemo(() => {
    const chain = CHAINS_MAP[chainId];

    return `${chain.blockExplorers?.default.url}/tx/${submittedTxHash}`;
  }, [chainId, submittedTxHash]);

  return (
    <Card className="m-4 h-60">
      <CardBody>
        <div className="text-sm text-default-500 m-2">
          {status === 0 ? 'Ready to sign transaction.' : status > 0 && 'Transaction prepared.'}
        </div>
        <div className="text-sm text-default-500 m-2">
          {status === 1 ? (
            <span className="flex gap-3">
              <Spinner size="sm" /> Signing transaction...
            </span>
          ) : (
            status > 1 && 'Transaction signed.'
          )}
        </div>
        <div className="text-sm text-default-500 m-2">
          {status === 2 ? (
            'Ready to encrypt transaction.'
          ) : status === 3 ? (
            <span className="flex gap-3">
              <Spinner size="sm" /> Encrypting transaction...
            </span>
          ) : (
            status > 3 && 'Transaction encrypted.'
          )}
        </div>
        <div className="text-sm text-default-500 m-2">
          {status === 4 ? (
            'Ready to submit transaction.'
          ) : status === 5 ? (
            <span className="flex gap-3">
              <Spinner size="sm" /> Submitting transaction...
            </span>
          ) : (
            status > 5 && 'Transaction submitted.'
          )}
        </div>

        {status >= 6 && <Divider />}

        {status >= 6 && (
          <p className="text-sm text-default-500 m-2">
            Submitted Tx:{' '}
            <Link href={txLink} isExternal size="sm" className="text-primary-500">
              {truncateNumberSymbols(submittedTxHash, 4)}
            </Link>
          </p>
        )}

        {status >= 7 && (
          <p className="text-sm text-default-500 m-2">
            Original Tx:{' '}
            <Link href="#" size="sm" className="text-primary-500">
              0x1234...5678
            </Link>
          </p>
        )}
      </CardBody>
    </Card>
  );
};
