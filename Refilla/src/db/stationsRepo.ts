// src/db/stationsRepo.ts

import { db } from "./database";
import { FilterStatus, StationStatus } from "../../types/station";

export type StationRow = {
  id: number;
  lat: number;
  lng: number;

  buildingAbre: string | null;
  buildingName: string | null;
  buildingDetails: string | null;

  filterStatus: FilterStatus;
  stationStatus: StationStatus;

  created_at: string;
  updated_at: string;
};

export function listStations(): StationRow[] {
  return db.getAllSync<StationRow>(`SELECT * FROM stations ORDER BY id;`);
}

export function getStation(id: number): StationRow | null {
  return (
    db.getFirstSync<StationRow>(`SELECT * FROM stations WHERE id = ?;`, [id]) ??
    null
  );
}

export function createStation(input: {
  lat: number;
  lng: number;

  buildingAbre?: string | null;
  buildingName?: string | null;
  buildingDetails?: string | null;

  filterStatus?: FilterStatus;
  stationStatus?: StationStatus;
}): number {
  const res = db.runSync(
    `INSERT INTO stations (
        buildingName,
        buildingAbre,
        buildingDetails,
        lat,
        lng,
        filterStatus,
        stationStatus
      )
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.buildingName ?? null,
      input.buildingAbre ?? null,
      input.buildingDetails ?? null,
      input.lat,
      input.lng,
      (input.filterStatus ?? "GREEN") as unknown as string,
      (input.stationStatus ?? "GREEN") as unknown as string,
    ]
  );

  return res.lastInsertRowId;
}

export function updateStation(
  id: number,
  patch: Partial<
    Pick<
      StationRow,
      | "buildingName"
      | "buildingAbre"
      | "buildingDetails"
      | "filterStatus"
      | "stationStatus"
      | "lat"
      | "lng"
    >
  >
) {
  db.runSync(
    `UPDATE stations SET
        buildingName    = COALESCE(?, buildingName),
        buildingAbre    = COALESCE(?, buildingAbre),
        buildingDetails = COALESCE(?, buildingDetails),
        filterStatus    = COALESCE(?, filterStatus),
        stationStatus   = COALESCE(?, stationStatus),
        lat             = COALESCE(?, lat),
        lng             = COALESCE(?, lng),
        updated_at      = datetime('now')
     WHERE id = ?;`,
    [
      patch.buildingName ?? null,
      patch.buildingAbre ?? null,
      patch.buildingDetails ?? null,
      (patch.filterStatus ?? null) as unknown as string | null,
      (patch.stationStatus ?? null) as unknown as string | null,
      patch.lat ?? null,
      patch.lng ?? null,
      id,
    ]
  );
}

export function deleteStation(id: number) {
  db.runSync(`DELETE FROM stations WHERE id = ?;`, [id]);
}
