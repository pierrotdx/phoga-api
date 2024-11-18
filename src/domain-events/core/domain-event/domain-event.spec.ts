import { isUuid } from "@shared";

import { DomainEventType } from "../models";
import { DomainEvent } from "./domain-event";

describe(`${DomainEvent.name}`, () => {
  const type = DomainEventType.ApiRequest;

  it(`should be created with an UUID`, () => {
    const event = new DomainEvent(type);
    expect(event._id).toBeDefined();
    expect(typeof event._id).toBe("string");
    expect(isUuid(event._id)).toBe(true);
    expect.assertions(3);
  });

  it("should be created with the input type", () => {
    const event = new DomainEvent(type);
    expect(event.type).toBe(type);
    expect.assertions(1);
  });

  it(`should be created with date`, () => {
    const event = new DomainEvent(type);
    expect(event.creationDate).toBeDefined();
    expect(event.creationDate).toBeInstanceOf(Date);
    expect.assertions(2);
  });

  it.each`
    expectedPayload
    ${{ test: 5 }}
    ${8}
    ${"dumb string"}
    ${undefined}
  `(
    "should have the expected payload (`$expectedPayload`) at creation",
    ({ expectedPayload }) => {
      const event = new DomainEvent(type, expectedPayload);
      expect(event.payload).toEqual(expectedPayload);
      expect.assertions(1);
    },
  );
});
