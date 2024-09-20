import { newMockEvent } from 'matchstick-as';
import { ethereum, Bytes } from '@graphprotocol/graph-ts';
import { Updated } from '../generated/ValidatorRegistry/ValidatorRegistry';

export function createUpdatedEvent(message: Bytes, signature: Bytes): Updated {
  const updatedEvent = changetype<Updated>(newMockEvent());

  updatedEvent.parameters = [];

  updatedEvent.parameters.push(
    new ethereum.EventParam('message', ethereum.Value.fromBytes(message)),
  );
  updatedEvent.parameters.push(
    new ethereum.EventParam('signature', ethereum.Value.fromBytes(signature)),
  );

  return updatedEvent;
}
