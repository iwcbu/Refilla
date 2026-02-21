// src/db/database.ts

import * as SQLite from "expo-sqlite";
import { migrate } from "./migrations";

export const db = SQLite.openDatabaseSync("refilla_v3.db");

db.execSync(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
`);

migrate(db);
