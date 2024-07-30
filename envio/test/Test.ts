import assert from "assert";
import { 
  TestHelpers,
  ValidatorRegistry_UpdatedEntity
} from "generated";
const { MockDb, ValidatorRegistry } = TestHelpers;

describe("ValidatorRegistry contract Updated event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for ValidatorRegistry contract Updated event
  const event = ValidatorRegistry.Updated.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  // Processing the event
  const mockDbUpdated = ValidatorRegistry.Updated.processEvent({
    event,
    mockDb,
  });

  it("ValidatorRegistry_UpdatedEntity is created correctly", () => {
    // Getting the actual entity from the mock database
    let actualValidatorRegistryUpdatedEntity = mockDbUpdated.entities.ValidatorRegistry_Updated.get(
      `${event.transactionHash}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedValidatorRegistryUpdatedEntity: ValidatorRegistry_UpdatedEntity = {
      id: `${event.transactionHash}_${event.logIndex}`,
      message: event.params.message,
      signature: event.params.signature,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualValidatorRegistryUpdatedEntity, expectedValidatorRegistryUpdatedEntity, "Actual ValidatorRegistryUpdatedEntity should be the same as the expectedValidatorRegistryUpdatedEntity");
  });
});
