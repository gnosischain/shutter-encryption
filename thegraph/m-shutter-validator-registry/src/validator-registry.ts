import { Updated as UpdatedEvent } from '../generated/ValidatorRegistry/ValidatorRegistry';
import { Updated } from '../generated/schema';

export function handleUpdated(event: UpdatedEvent): void {
  const entity = new Updated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.message = event.params.message;
  entity.signature = event.params.signature;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
