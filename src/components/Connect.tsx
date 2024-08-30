import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Chip } from '@nextui-org/react';

const WHITELISTED_CONNECTOR_IDS = [
  // Brave Wallet
  'com.brave.wallet',
];

export const Connect = () => {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [tip, setTip] = useState('');

  useEffect(() => {
    if (address && connector && !WHITELISTED_CONNECTOR_IDS.includes(connector.id)) {
      disconnect();
      setTip('Please, use Brave Wallet.');
    } else if (address && connector && WHITELISTED_CONNECTOR_IDS.includes(connector.id)) {
      setTip('');
    }
  }, [address, connector]);

  return (
    <div className="flex flex-col items-center">
      <w3m-button balance="show" size="sm" />

      {tip && (
        <Chip className="mr-1 scale-75" size="sm" color="warning">
          {tip}
        </Chip>
      )}
    </div>
  );
};
