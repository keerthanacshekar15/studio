
import { MockDB } from './mock-db';

// This is a common pattern to ensure a single instance of a class is used across
// the application, especially in a development environment with hot-reloading.
// We attach the instance to the global object to prevent it from being re-created
// on every module reload.

declare global {
  // We use `var` so the declaration is hoisted and we can safely access it.
  // eslint-disable-next-line no-var
  var __db_instance: MockDB | undefined;
}

let db: MockDB;

if (process.env.NODE_ENV === 'production') {
  db = new MockDB();
} else {
  if (!global.__db_instance) {
    global.__db_instance = new MockDB();
  }
  db = global.__db_instance;
}

export { db };
