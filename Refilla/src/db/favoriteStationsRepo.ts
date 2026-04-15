// src/db/favoriteStationsRepo.ts

import { db } from "./database";
import type { StationRow } from "./stationsRepo";

export type FavoriteStationRow = {
  user_id: number;
  station_id: number;
  created_at: string;
};

export function listFavoriteStationIdsForUser(userId: number): number[] {
  const rows = db.getAllSync<{ station_id: number }>(
    `SELECT station_id
     FROM favorite_stations
     WHERE user_id = ?
     ORDER BY created_at DESC;`,
    [userId]
  );

  return rows.map((row) => row.station_id);
}

export function listFavoriteStationsForUser(userId: number): StationRow[] {
  return db.getAllSync<StationRow>(
    `SELECT s.*
     FROM favorite_stations fs
     JOIN stations s ON s.id = fs.station_id
     WHERE fs.user_id = ?
     ORDER BY fs.created_at DESC;`,
    [userId]
  );
}

export function isFavoriteStation(userId: number, stationId: number): boolean {
  const row = db.getFirstSync<{ station_id: number }>(
    `SELECT station_id
     FROM favorite_stations
     WHERE user_id = ? AND station_id = ?
     LIMIT 1;`,
    [userId, stationId]
  );

  return row != null;
}

export function addFavoriteStation(userId: number, stationId: number): void {
  db.runSync(
    `INSERT OR IGNORE INTO favorite_stations (user_id, station_id)
     VALUES (?, ?);`,
    [userId, stationId]
  );
}

export function removeFavoriteStation(userId: number, stationId: number): void {
  db.runSync(
    `DELETE FROM favorite_stations
     WHERE user_id = ? AND station_id = ?;`,
    [userId, stationId]
  );
}

export function toggleFavoriteStation(userId: number, stationId: number): boolean {
  if (isFavoriteStation(userId, stationId)) {
    removeFavoriteStation(userId, stationId);
    return false;
  }

  addFavoriteStation(userId, stationId);
  return true;
}

export function countFavoriteStationsForUser(userId: number): number {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM favorite_stations
     WHERE user_id = ?;`,
    [userId]
  );

  return Number(row?.count ?? 0);
}
