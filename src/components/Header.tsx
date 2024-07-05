import { Image } from '@nextui-org/react';

import { Connect } from '@/components/Connect';

export const Header = () => {
  return (
    <div className="w-full sticky top-0 z-20 flex justify-between items-center p-3 bg-[#3E6957]">
      <div className="flex gap-x-2 items-center text-2xl">
        <Image src="/gnosis.svg" alt="Gnosis" width={40} height={40} /> Gnosis Shutter
      </div>
      <Connect />
    </div>
  );
};