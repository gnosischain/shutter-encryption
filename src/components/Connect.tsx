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
    <div className="flex flex-row items-center">
      {tip && (
        <Chip size="sm" color="danger">
          {tip}
        </Chip>
      )}

      <w3m-button balance="show" size="sm" />
    </div>
  );
};
