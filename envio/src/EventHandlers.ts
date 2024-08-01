/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  ValidatorIndexEntity,
  ValidatorRegistryContract,
  ValidatorRegistry_UpdatedEntity,
} from "generated";
import { bytesToString, toBytes } from "viem";

// Version: 1 byte
// Chain ID: 8 bytes
// Validator Registry Address: 20 bytes (Ethereum address)
// Validator Index: 8 bytes
// Nonce: 8 bytes
// Action: 1 byte
const offset = 1 + 8 + 20; // skip Version, Chain ID, and Address

ValidatorRegistryContract.Updated.handler(({ event, context }) => {
  const entity: ValidatorRegistry_UpdatedEntity = {
    id: `${event.transactionHash}_${event.logIndex}`,
    message: event.params.message,
    signature: event.params.signature,
  };

  context.ValidatorRegistry_Updated.set(entity);

  const register = event.params.message[event.params.message.length - 1] === '1';

  const messageBytes = toBytes(event.params.message);
  const validatorIndexBytes = messageBytes.slice(offset, offset + 8);
  const validatorIndex = BigInt(`0x${Buffer.from(validatorIndexBytes).toString('hex')}`).toString();

  const validatorEntity: ValidatorIndexEntity = {
    id: validatorIndex,
    active: register,
  };

  context.ValidatorIndex.set(validatorEntity);
});

