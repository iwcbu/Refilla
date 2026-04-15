// src/db/migrations.ts

import type { SQLiteDatabase } from "expo-sqlite";

export function migrate(db: SQLiteDatabase) {
  
  if (!db) {
    throw new Error("migrate() called with undefined db");
  }

  db.execSync(`

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      lat REAL NOT NULL,
      lng REAL NOT NULL,

      organization_id INTEGER,
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
      user_id INTEGER NOT NULL,
      author_profile_key TEXT,
      author_username TEXT,
      author_avatar_emoji TEXT,
      station_id INTEGER NOT NULL,

      title TEXT NOT NULL,
      body TEXT,

      status TEXT NOT NULL DEFAULT 'OPEN',
      category TEXT NOT NULL DEFAULT 'OTHER',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_station_id ON tickets(station_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);


    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      profile_key TEXT UNIQUE,
      avatar_emoji TEXT NOT NULL DEFAULT '🙂',
      points INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ORGANIZATIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS USER_ORGANIZATIONS (
      user_id INTEGER NOT NULL,
      org_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'MEMBER',
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, org_id),
      FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
      FOREIGN KEY (org_id) REFERENCES ORGANIZATIONS(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_orgs_user_id ON USER_ORGANIZATIONS(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_orgs_org_id ON USER_ORGANIZATIONS(org_id);

    CREATE TABLE IF NOT EXISTS favorite_stations (
      user_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, station_id),
      FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
      FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_favorite_stations_user_id ON favorite_stations(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorite_stations_station_id ON favorite_stations(station_id);

    CREATE TABLE IF NOT EXISTS org_buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER,
      buildingName TEXT NOT NULL,
      buildingAbre TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES ORGANIZATIONS(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_org_buildings_org_id ON org_buildings(organization_id);
    CREATE INDEX IF NOT EXISTS idx_org_buildings_name ON org_buildings(buildingName);
    CREATE INDEX IF NOT EXISTS idx_org_buildings_abre ON org_buildings(buildingAbre);

    `);

  const userColumns = db.getAllSync<{ name: string }>(`PRAGMA table_info(USERS);`);
  const hasAvatarEmoji = userColumns.some((column) => column.name === "avatar_emoji");
  const hasProfileKey = userColumns.some((column) => column.name === "profile_key");

  if (!hasAvatarEmoji) {
    db.execSync(`
      ALTER TABLE USERS
      ADD COLUMN avatar_emoji TEXT NOT NULL DEFAULT '🙂';
    `);
  }

  if (!hasProfileKey) {
    db.execSync(`
      ALTER TABLE USERS
      ADD COLUMN profile_key TEXT;
    `);
  }

  const usersMissingProfileKey = db.getAllSync<{ id: number }>(
    `SELECT id FROM users WHERE profile_key IS NULL OR trim(profile_key) = '';`
  );

  for (const user of usersMissingProfileKey) {
    db.runSync(
      `UPDATE users
       SET profile_key = ?
       WHERE id = ?;`,
      [`local-profile-${user.id}`, user.id]
    );
  }

  db.execSync(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_profile_key ON users(profile_key);
  `);

  const ticketColumns = db.getAllSync<{ name: string }>(`PRAGMA table_info(tickets);`);
  const hasAuthorProfileKey = ticketColumns.some((column) => column.name === "author_profile_key");
  const hasAuthorUsername = ticketColumns.some((column) => column.name === "author_username");
  const hasAuthorAvatarEmoji = ticketColumns.some(
    (column) => column.name === "author_avatar_emoji"
  );

  if (!hasAuthorProfileKey) {
    db.execSync(`
      ALTER TABLE tickets
      ADD COLUMN author_profile_key TEXT;
    `);
  }

  if (!hasAuthorUsername) {
    db.execSync(`
      ALTER TABLE tickets
      ADD COLUMN author_username TEXT;
    `);
  }

  if (!hasAuthorAvatarEmoji) {
    db.execSync(`
      ALTER TABLE tickets
      ADD COLUMN author_avatar_emoji TEXT;
    `);
  }

  db.execSync(`
    UPDATE tickets
    SET
      author_profile_key = COALESCE(
        author_profile_key,
        (SELECT profile_key FROM users WHERE users.id = tickets.user_id)
      ),
      author_username = COALESCE(
        author_username,
        (SELECT username FROM users WHERE users.id = tickets.user_id)
      ),
      author_avatar_emoji = COALESCE(
        author_avatar_emoji,
        (SELECT avatar_emoji FROM users WHERE users.id = tickets.user_id)
      )
    WHERE author_profile_key IS NULL
       OR author_username IS NULL
       OR author_avatar_emoji IS NULL;
  `);

  const orgBuildingColumns = db.getAllSync<{ name: string }>(
    `PRAGMA table_info(org_buildings);`
  );
  const hasOrgBuildingOrganizationId = orgBuildingColumns.some(
    (column) => column.name === "organization_id"
  );
  const hasOrgBuildingId = orgBuildingColumns.some((column) => column.name === "id");
  const hasOrgBuildingName = orgBuildingColumns.some(
    (column) => column.name === "buildingName"
  );
  const hasOrgBuildingAbre = orgBuildingColumns.some(
    (column) => column.name === "buildingAbre"
  );
  const hasOrgBuildingCreatedAt = orgBuildingColumns.some(
    (column) => column.name === "created_at"
  );
  const hasOrgBuildingUpdatedAt = orgBuildingColumns.some(
    (column) => column.name === "updated_at"
  );

  if (!hasOrgBuildingOrganizationId) {
    db.execSync(`
      ALTER TABLE org_buildings
      ADD COLUMN organization_id INTEGER;
    `);
  }

  if (!hasOrgBuildingId || !hasOrgBuildingName || !hasOrgBuildingAbre) {
    throw new Error("org_buildings table is missing required columns. Please reset the local database.");
  }

  if (!hasOrgBuildingCreatedAt) {
    db.execSync(`
      ALTER TABLE org_buildings
      ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'));
    `);
  }

  if (!hasOrgBuildingUpdatedAt) {
    db.execSync(`
      ALTER TABLE org_buildings
      ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));
    `);
  }

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_org_buildings_org_id ON org_buildings(organization_id);
    CREATE INDEX IF NOT EXISTS idx_org_buildings_name ON org_buildings(buildingName);
    CREATE INDEX IF NOT EXISTS idx_org_buildings_abre ON org_buildings(buildingAbre);
  `);
}
