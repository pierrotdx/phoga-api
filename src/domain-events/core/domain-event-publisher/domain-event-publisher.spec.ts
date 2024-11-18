import { EventEmitter } from "events";

import { DomainEvent } from "../domain-event/domain-event";
import { DomainEventType, EventName, IDomainEventPublisher } from "../models";
import { DomainEventPublisher } from "./domain-event-publisher";

describe(`${DomainEventPublisher.name}`, () => {
  const type = DomainEventType.ApiRequest;
  const sampleEvents = [
    new DomainEvent(type, { test: "abc" }),
    new DomainEvent(type, 456874165),
    new DomainEvent(type, "some string"),
  ];
  let domainEventPublisher: IDomainEventPublisher;

  beforeEach(() => {
    domainEventPublisher = new DomainEventPublisher();
  });

  describe(`${DomainEventPublisher.prototype.addEvent.name}`, () => {
    const emitSpy = jest.spyOn(EventEmitter.prototype, "emit");

    beforeEach(() => {
      emitSpy.mockReset();
    });

    sampleEvents.forEach((event) => {
      it("should emit the input domain event", () => {
        domainEventPublisher.addEvent<unknown>(event);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenLastCalledWith(EventName, event);
        expect.assertions(2);
      });
    });
  });

  describe(`${DomainEventPublisher.prototype.addListener.name}`, () => {
    const addListenerSpy = jest.spyOn(EventEmitter.prototype, "addListener");
    const dumbListener = (data: any) => {
      console.log(data);
    };

    beforeEach(() => {
      addListenerSpy.mockReset();
    });

    sampleEvents.forEach((event) => {
      it(`should add a listener to the event named \`${EventName}\``, () => {
        domainEventPublisher.addListener(dumbListener);
        expect(addListenerSpy).toHaveBeenCalledTimes(1);
        expect(addListenerSpy).toHaveBeenLastCalledWith(
          EventName,
          dumbListener,
        );
        expect.assertions(2);
      });
    });
  });
});
