import { DomainEvent } from "../domain-event";

export interface IDomainEventPublisher {
  addEvent<TData>(event: DomainEvent<TData>): void;
  addListener(listener: (...args: any[]) => void): void;
}
