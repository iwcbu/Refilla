// src/db/migrations.ts
import { db } from "./database";

export function migrate() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      lat REAL NOT NULL,
      lng REAL NOT NULL,

      buildingAbre TEXT,
      buildingName TEXT,
      buildingDetails TEXT,

      filterStatus TEXT NOT NULL DEFAULT 'GREEN',
      stationStatus TEXT NOT NULL DEFAULT 'GREEN',

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stations_lat_lng ON stations(lat, lng);
    CREATE INDEX IF NOT EXISTS idx_stations_filterStatus ON stations(filterStatus);
    CREATE INDEX IF NOT EXISTS idx_stations_stationStatus ON stations(stationStatus);

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_station_id ON tickets(station_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  `);
}
