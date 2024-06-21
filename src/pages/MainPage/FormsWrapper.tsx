import { Tabs, Tab, Button } from '@nextui-org/react';
import { useState } from 'react';

import { TransferForm } from './TransferForm';
import { AdvancedForm } from './AdvancedForm';
import { ProgressInfoCard } from './ProgressInfoCard';

// status = 0 -> preparing
// status = 1 -> signing
// status = 2 -> encrypting
// status = 3 -> submitting
// status = 4 -> submitted tx
// status = 5 -> original tx

export const FormsWrapper = () => {
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-96 p-4">
        <Tabs fullWidth color="primary" className="">
          <Tab className="focus:outline-none" key="transfer" title="Transfer">
            <TransferForm />
          </Tab>
          <Tab className="focus:outline-none" key="advanced" title="Advanced">
            <AdvancedForm />
          </Tab>
        </Tabs>

        <Button onClick={() => setStatus(s => s+1)} color="primary" className="w-full mt-4 focus:outline-none">
          Encrypt
        </Button>
      </div>

      <ProgressInfoCard status={status} />
    </div>
  )
};
