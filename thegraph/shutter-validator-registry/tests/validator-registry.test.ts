import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes } from "@graphprotocol/graph-ts"
import { Updated } from "../generated/schema"
import { Updated as UpdatedEvent } from "../generated/ValidatorRegistry/ValidatorRegistry"
import { handleUpdated } from "../src/validator-registry"
import { createUpdatedEvent } from "./validator-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let message = Bytes.fromI32(1234567890)
    let signature = Bytes.fromI32(1234567890)
    let newUpdatedEvent = createUpdatedEvent(message, signature)
    handleUpdated(newUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Updated created and stored", () => {
    assert.entityCount("Updated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Updated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "message",
      "1234567890"
    )
    assert.fieldEquals(
      "Updated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "signature",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
