import { UuidGenerator } from "@shared";

import { DomainEventType, IDomainEvent } from "../models";

export class DomainEvent<TPayload> implements IDomainEvent<TPayload> {
  public readonly _id: string;
  public readonly creationDate: Date;

  constructor(
    public readonly type: DomainEventType,
    public readonly payload?: TPayload,
  ) {
    this._id = new UuidGenerator().generate();
    this.creationDate = new Date();
  }
}
