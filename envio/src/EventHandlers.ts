/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  ValidatorRegistryContract,
  ValidatorRegistry_UpdatedEntity,
} from "generated";

ValidatorRegistryContract.Updated.handler(({ event, context }) => {
  const entity: ValidatorRegistry_UpdatedEntity = {
    id: `${event.transactionHash}_${event.logIndex}`,
    message: event.params.message,
    signature: event.params.signature,
  };

  context.ValidatorRegistry_Updated.set(entity);
});
