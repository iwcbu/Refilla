// src/db/database.ts

import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("refilla_v3.db");

export function configureDb() {
  db.execSync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);
}
