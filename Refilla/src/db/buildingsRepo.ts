import { db } from "./database";
import { requireSupabase } from "../lib/sharedData";

export type OrgBuildingRow = {
  id: number;
  organization_id: number | null;
  buildingName: string;
  buildingAbre: string;
  created_at: string;
  updated_at: string;
};

export type BuildingOption = OrgBuildingRow & {
  key: string;
};

type BuildingIdentityInput = {
  organization_id?: number | null;
  buildingName: string;
  buildingAbre: string;
};

function normalizeBuildingName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeBuildingAbre(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function mapRowToOption(row: OrgBuildingRow): BuildingOption {
  return {
    ...row,
    key: `${row.id}:${row.organization_id ?? "public"}:${row.buildingName}:${row.buildingAbre}`,
  };
}

function upsertBuilding(row: OrgBuildingRow) {
  db.runSync(
    `INSERT OR REPLACE INTO org_buildings
      (id, organization_id, buildingName, buildingAbre, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      row.id,
      row.organization_id,
      row.buildingName,
      row.buildingAbre,
      row.created_at,
      row.updated_at,
    ]
  );
}

export function listBuildingsForOrganization(organizationId: number | null): BuildingOption[] {
  const rows = db.getAllSync<OrgBuildingRow>(
    `SELECT *
     FROM org_buildings
     WHERE ((organization_id IS NULL AND ? IS NULL) OR organization_id = ?)
     ORDER BY buildingName COLLATE NOCASE ASC, buildingAbre COLLATE NOCASE ASC;`,
    [organizationId, organizationId]
  );

  return rows.map(mapRowToOption);
}

export function getBuildingById(id: number): OrgBuildingRow | null {
  return (
    db.getFirstSync<OrgBuildingRow>(
      `SELECT * FROM org_buildings WHERE id = ?;`,
      [id]
    ) ?? null
  );
}

export function getBuildingByNameOrAbre(
  organizationId: number | null,
  queryText: string
): OrgBuildingRow | null {
  const normalizedQuery = normalizeBuildingName(queryText);
  if (!normalizedQuery) {
    return null;
  }

  return (
    db.getFirstSync<OrgBuildingRow>(
      `SELECT *
       FROM org_buildings
       WHERE ((organization_id IS NULL AND ? IS NULL) OR organization_id = ?)
         AND (
           lower(trim(buildingName)) = lower(trim(?))
           OR lower(trim(buildingAbre)) = lower(trim(?))
         )
       LIMIT 1;`,
      [organizationId, organizationId, normalizedQuery, normalizedQuery]
    ) ?? null
  );
}

async function syncAllBuildingsInternal(): Promise<OrgBuildingRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("org_buildings").select("*").order("id");

  if (error) {
    throw new Error(error.message);
  }

  const buildings = (data ?? []) as OrgBuildingRow[];
  const nextIds = new Set(buildings.map((building) => building.id));

  for (const building of buildings) {
    upsertBuilding(building);
  }

  const currentIds = db.getAllSync<{ id: number }>(`SELECT id FROM org_buildings;`);
  for (const row of currentIds) {
    if (!nextIds.has(row.id)) {
      db.runSync(`DELETE FROM org_buildings WHERE id = ?;`, [row.id]);
    }
  }

  return buildings;
}

export async function syncBuildingsForOrganization(
  organizationId: number | null
): Promise<BuildingOption[]> {
  await syncAllBuildingsInternal();
  return listBuildingsForOrganization(organizationId);
}

export async function createBuilding(input: BuildingIdentityInput): Promise<number> {
  const organizationId = input.organization_id ?? null;
  const buildingName = normalizeBuildingName(input.buildingName);
  const buildingAbre = normalizeBuildingAbre(input.buildingAbre);

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("org_buildings")
    .insert({
      organization_id: organizationId,
      buildingName,
      buildingAbre,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  upsertBuilding(data as OrgBuildingRow);
  return Number(data.id);
}

export async function ensureBuilding(input: BuildingIdentityInput): Promise<OrgBuildingRow> {
  const existingByName = getBuildingByNameOrAbre(input.organization_id ?? null, input.buildingName);
  if (existingByName && existingByName.buildingAbre === normalizeBuildingAbre(input.buildingAbre)) {
    return existingByName;
  }

  const id = await createBuilding(input);
  const building = getBuildingById(id);
  if (!building) {
    throw new Error("Could not create building.");
  }

  return building;
}

export async function updateBuilding(
  id: number,
  patch: {
    organization_id?: number | null;
    buildingName?: string | null;
    buildingAbre?: string | null;
  }
): Promise<void> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("org_buildings")
    .update({
      organization_id: patch.organization_id,
      buildingName:
        patch.buildingName == null ? undefined : normalizeBuildingName(patch.buildingName),
      buildingAbre:
        patch.buildingAbre == null ? undefined : normalizeBuildingAbre(patch.buildingAbre),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  upsertBuilding(data as OrgBuildingRow);
}

export async function deleteBuilding(id: number): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("org_buildings").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  db.runSync(`DELETE FROM org_buildings WHERE id = ?;`, [id]);
}
