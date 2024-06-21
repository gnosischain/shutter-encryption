import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { useState } from 'react';

import { TransferForm } from './TransferForm';
import { AdvancedForm } from './AdvancedForm';

export const FormsWrapper = () => {
  const [status, setStatus] = useState<'preparing' | 'signing' | 'encrypting' | 'submitting'>('preparing');

  return (
    <div className="w-96 p-4">
      <Tabs fullWidth color="primary" className="">
        <Tab className="focus:outline-none" key="transfer" title="Transfer">
          <TransferForm />
        </Tab>
        <Tab className="focus:outline-none" key="advanced" title="Advanced">
          <AdvancedForm />
        </Tab>
      </Tabs>

      <Button color="primary" className="w-full mt-4 focus:outline-none">
        Encrypt
      </Button>
    </div>
  )
};
