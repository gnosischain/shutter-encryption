import { ShutterTimer } from '@/shared/ShutterTimer';

import { FormsWrapper } from './FormsWrapper';
import { FAQAccordion } from './FAQAccordion';

export const MainPage = () => {
  return (
    <div className="flex items-center w-full flex-col text-white">
      <ShutterTimer />

      <FormsWrapper/>

      <FAQAccordion/>
    </div>
  );
};
