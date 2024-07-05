import { FormsWrapper } from './FormsWrapper';
import { FAQAccordion } from './FAQAccordion';

export const MainPage = () => {
  return (
    <div className="flex items-center w-full flex-col text-white">
      <FormsWrapper />

      <FAQAccordion />
    </div>
  );
};
