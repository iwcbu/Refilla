import { db } from "./database";
import { FilterStatus, StationStatus } from "../../types/station";
import { requireSupabase } from "../lib/sharedData";

export type StationRow = {
  id: number;
  lat: number;
  lng: number;
  organization_id: number | null;
  buildingAbre: string | null;
  buildingName: string | null;
  buildingDetails: string | null;
  filterStatus: FilterStatus;
  stationStatus: StationStatus;
  created_at: string;
  updated_at: string;
};

function upsertStation(row: StationRow) {
  db.runSync(
    `INSERT OR REPLACE INTO stations
      (id, lat, lng, organization_id, buildingAbre, buildingName, buildingDetails, filterStatus, stationStatus, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      row.id,
      row.lat,
      row.lng,
      row.organization_id,
      row.buildingAbre,
      row.buildingName,
      row.buildingDetails,
      row.filterStatus,
      row.stationStatus,
      row.created_at,
      row.updated_at,
    ]
  );
}

export function listStations(): StationRow[] {
  return db.getAllSync<StationRow>(`SELECT * FROM stations ORDER BY id;`);
}

export function getStation(id: number): StationRow | null {
  return (
    db.getFirstSync<StationRow>(`SELECT * FROM stations WHERE id = ?;`, [id]) ??
    null
  );
}

export async function syncStations(): Promise<StationRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("stations").select("*").order("id");

  if (error) {
    throw new Error(error.message);
  }

  const stations = (data ?? []) as StationRow[];
  const nextIds = new Set(stations.map((station) => station.id));

  for (const station of stations) {
    upsertStation(station);
  }

  const currentIds = db.getAllSync<{ id: number }>(`SELECT id FROM stations;`);
  for (const row of currentIds) {
    if (!nextIds.has(row.id)) {
      db.runSync(`DELETE FROM stations WHERE id = ?;`, [row.id]);
    }
  }

  return listStations();
}

export async function createStation(input: {
  lat: number;
  lng: number;
  organization_id?: number | null;
  buildingAbre?: string | null;
  buildingName?: string | null;
  buildingDetails?: string | null;
  filterStatus?: FilterStatus;
  stationStatus?: StationStatus;
}): Promise<number> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("stations")
    .insert({
      lat: input.lat,
      lng: input.lng,
      organization_id: input.organization_id ?? null,
      buildingAbre: input.buildingAbre ?? null,
      buildingName: input.buildingName ?? null,
      buildingDetails: input.buildingDetails ?? null,
      filterStatus: input.filterStatus ?? "GREEN",
      stationStatus: input.stationStatus ?? "GREEN",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  upsertStation(data as StationRow);
  return Number(data.id);
}

export async function updateStation(
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
      | "organization_id"
    >
  >
): Promise<void> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("stations")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  upsertStation(data as StationRow);
}

export async function deleteStation(id: number): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("stations").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  db.runSync(`DELETE FROM stations WHERE id = ?;`, [id]);
}
