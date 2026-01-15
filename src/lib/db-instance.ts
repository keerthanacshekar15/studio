
import { MockDB } from './mock-db';

// By creating a single instance of the DB and exporting it, we can ensure that
// the same instance is used across different server-side modules. This mimics
// a persistent data store during the development server's lifecycle.
export const db = new MockDB();
