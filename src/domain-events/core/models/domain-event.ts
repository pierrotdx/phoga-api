import { DomainEventType } from "./domain-event-type";

export interface IDomainEvent<TData = any> {
  _id: string;
  creationDate: Date;
  payload?: TData;
  type: DomainEventType;
}
