import { Image } from '@nextui-org/react';

import { Connect } from '@/components/Connect';

export const Header = () => {
  return (
    <div className="h-12 items-center bg-background w-full flex justify-between p-2">
      <div className="flex items-center text-2xl">
        <Image className="w-12" src="/gnosis.png" /> Shutter
      </div>
      <Connect />
    </div>
  )
}