import { MongoDoc } from "./mongo-doc";

export type MongoStore<T> = T & MongoDoc;
