import EventEmitter from "events";

import { DomainEvent } from "../domain-event/domain-event";
import { IDomainEventPublisher } from "../models";
import { EventName } from "../models/event-name";

export class DomainEventPublisher implements IDomainEventPublisher {
  private readonly publisher = new EventEmitter();

  addEvent<TData>(event: DomainEvent<TData>): void {
    this.publisher.emit(EventName, event);
  }

  addListener(listener: (...args: any[]) => void): void {
    this.publisher.addListener(EventName, listener);
  }
}
