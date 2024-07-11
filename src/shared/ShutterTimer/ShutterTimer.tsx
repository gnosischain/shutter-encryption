import { CircularProgress, Tooltip } from '@nextui-org/react';
import { useShutterValidators } from './ShutterValidatorsProvider';


export const ShutterTimer = () => {
  const { timeDifference } = useShutterValidators();

  return (
    <div className="fixed bottom-0 right-4 text-xs w-full flex justify-end">
      <Tooltip content={`Next Shutter transactions will be included in ~${timeDifference} seconds`} color='warning' placement='left'>
        <CircularProgress
          className="my-4"
          aria-label="Loading..."
          size="lg"
          value={100 - timeDifference}
          color="warning"
          showValueLabel={true}
        />
      </Tooltip>
    </div>
  );
};
