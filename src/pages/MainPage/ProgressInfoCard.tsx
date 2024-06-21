import { Card, CardBody, Divider, Link, Spinner } from '@nextui-org/react';

interface ProgressInfoCardProps {
  status: number;
  submittedTx?: string;
  originalTx?: string;
}

export const ProgressInfoCard = ({ status }: ProgressInfoCardProps) => {
  return (
    <Card className="m-4 h-60">
      <CardBody>
        <p className="text-sm text-default-500 m-2">
          {status === 0 ? (<span className="flex gap-3"><Spinner size="sm" /> Preparing transaction...</span>) : status > 0 && 'Transaction prepared.'}
        </p>
        <p className="text-sm text-default-500 m-2">
          {status === 1 ? (<span className="flex gap-3"><Spinner size="sm" /> Signing transaction...</span>) : status > 1 && 'Transaction signed.'}
        </p>
        <p className="text-sm text-default-500 m-2">
          {status === 2 ? (<span className="flex gap-3"><Spinner size="sm" /> Encrypting transaction...</span>) : status > 2 && 'Transaction encrypted.'}
        </p>
        <p className="text-sm text-default-500 m-2">
          {status === 3 ? (<span className="flex gap-3"><Spinner size="sm" /> Submitting transaction...</span>) : status > 3 && 'Transaction submitted.'}
        </p>

        {status >= 4 && (<Divider />)}

        {status >= 4 && (
          <p className="text-sm text-default-500 m-2">
            Submitted Tx: <Link href="#" size="sm" className="text-primary-500">0x1234...5678</Link>
          </p>
        )}

        {status >= 5 && (
          <p className="text-sm text-default-500 m-2">
            Original Tx: <Link href="#" size="sm" className="text-primary-500">0x1234...5678</Link>
          </p>
        )}
      </CardBody>
    </Card>
  )
};
