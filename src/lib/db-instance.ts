
import { MockDB } from './mock-db';

// Create and export a single, shared instance of the mock database.
// This ensures that the same in-memory database is used across all server-side operations,
// making data persistent for the lifetime of the server process.
export const db = new MockDB();
