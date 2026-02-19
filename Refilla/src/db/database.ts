// src/db/database.ts

import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("refilla_v2.db");

export function configureDb() {
  db.execSync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);
}
