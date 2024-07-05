import { Image } from '@nextui-org/react';

import { Connect } from '@/components/Connect';

export const Header = () => {
  return (
    // <div className="w-full sticky top-0 z-20 flex flex-col items-center">
    //   <div className="w-full flex justify-between items-center p-4 bg-[#3E6957]">
    //     <div className="flex items-center gap-x-4">
    //       <Image src={"/gnosis.svg"} alt={"Gnosis"} width={125} height={125} />
         
    //     </div>
      
    //   </div>
    //   <div className={`h-screen fixed top-0 right-0 flex flex-col bg-[#133629B2] backdrop-blur-md transition-all transform duration-300 ease-in-out rounded-b-md ${isMenuOpen ? "w-[80%] p-4" : "w-0"} overflow-hidden`}>
    //     <div className="w-full flex justify-end" onClick={() => setIsMenuOpen(false)}>
    //       <XMarkIcon width={30} height={30} />
    //     </div>
    //     <Link href="https://docs.gnosischain.com/" target="_blank" className="flex items-center gap-x-2 p-4">
    //       Developers
    //       <ArrowTopRightOnSquareIcon width={15} height={15} />
    //     </Link>
    //     <Link href="https://docs.gnosischain.com/faq/node/" target="_blank" className="flex items-center gap-x-2 p-4">
    //       Validators
    //       <ArrowTopRightOnSquareIcon width={15} height={15} />
    //     </Link>
    //     <Link href="https://forum.gnosis.io/" target="_blank" className="flex items-center gap-x-2 p-4">
    //       Forum
    //       <ArrowTopRightOnSquareIcon width={15} height={15} />
    //     </Link>
    //     <Link href="https://tally.so/r/3lrN05" target="_blank" className="flex w-fit mt-3 ml-3 items-center gap-x-2 px-4 py-2 bg-[#DD7143] rounded-xl">
    //       Join us
    //       <ArrowTopRightOnSquareIcon width={15} height={15} />
    //     </Link>
    //   </div>
    // </div>
    <div className="w-full sticky top-0 z-20 flex justify-between items-center p-3 bg-[#3E6957]">
      <div className="flex gap-x-2 items-center text-2xl">
        <Image src="/gnosis.svg" alt="Gnosis" width={40} height={40} /> Gnosis Shutter
      </div>
      <Connect />
    </div>
  );
};