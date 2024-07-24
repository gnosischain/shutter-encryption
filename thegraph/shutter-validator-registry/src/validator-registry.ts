import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import { Updated as UpdatedEvent } from '../generated/ValidatorRegistry/ValidatorRegistry';
import { Updated } from '../generated/schema';

function extractValidatorIndex(messageBytes: Bytes): BigInt {
  // Convert hex to bytes
  // const messageBytes = utils.arrayify(messageHex);

  // Version: 1 byte
  // Chain ID: 8 bytes
  // Validator Registry Address: 20 bytes (Ethereum address)
  // Validator Index: 8 bytes
  // Nonce: 8 bytes
  // Action: 1 byte
  const offset = 1 + 8 + 20; // skip Version, Chain ID, and Address
  const validatorIndexBytes = Bytes.fromUint8Array(messageBytes.slice(offset, offset + 8));

  // Convert from bytes to big-endian integer
  return BigInt.fromByteArray(validatorIndexBytes);
}

function extractSubscriptionStatus(messageBytes: Bytes): boolean {
  const messageHex = messageBytes.toHexString();

  return messageHex[messageHex.length - 1] === '1';
}

export function handleUpdated(event: UpdatedEvent): void {
  const entity = new Updated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.message = event.params.message;
  entity.signature = event.params.signature;
  entity.validatorIndex = extractValidatorIndex(event.params.message);
  entity.subscriptionStatus = extractSubscriptionStatus(event.params.message);

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
