import { db } from "./database";
import {
  buildMissingTableError,
  isMissingSupabaseTableMessage,
  requireSupabase,
} from "../lib/sharedData";

export type OrganizationRow = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

function upsertOrganization(row: OrganizationRow) {
  db.runSync(
    `INSERT OR REPLACE INTO organizations (id, name, created_at, updated_at)
     VALUES (?, ?, ?, ?);`,
    [row.id, row.name, row.created_at, row.updated_at]
  );
}

export function listOrgs(): OrganizationRow[] {
  return db.getAllSync<OrganizationRow>(
    `SELECT * FROM organizations ORDER BY id;`
  );
}

export const listAllOrgIds = listOrgs;

export function getOrgbyNameContains(name: string): OrganizationRow | null {
  return (
    db.getFirstSync<OrganizationRow>(
      `SELECT * FROM organizations WHERE name LIKE ?;`,
      [`%${name}%`]
    ) ?? null
  );
}

export function getOrg(id: number): OrganizationRow | null {
  return (
    db.getFirstSync<OrganizationRow>(
      `SELECT * FROM organizations WHERE id = ?;`,
      [id]
    ) ?? null
  );
}

export async function syncOrganizations(): Promise<OrganizationRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("organizations").select("*").order("id");

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      console.log(buildMissingTableError("organizations").message);
      return listOrgs();
    }
    throw new Error(error.message);
  }

  const organizations = (data ?? []) as OrganizationRow[];
  const nextIds = new Set(organizations.map((organization) => organization.id));

  for (const organization of organizations) {
    upsertOrganization(organization);
  }

  const currentIds = db.getAllSync<{ id: number }>(`SELECT id FROM organizations;`);
  for (const row of currentIds) {
    if (!nextIds.has(row.id)) {
      db.runSync(`DELETE FROM organizations WHERE id = ?;`, [row.id]);
    }
  }

  return listOrgs();
}

export async function createOrg(name: string): Promise<number> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name })
    .select("*")
    .single();

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("organizations");
    }
    throw new Error(error.message);
  }

  upsertOrganization(data as OrganizationRow);
  return Number(data.id);
}

export async function updateOrg(
  id: number,
  patch: {
    name?: string | null;
  }
): Promise<void> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("organizations")
    .update({
      name: patch.name ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("organizations");
    }
    throw new Error(error.message);
  }

  upsertOrganization(data as OrganizationRow);
}

export async function deleteOrg(id: number): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("organizations").delete().eq("id", id);
  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("organizations");
    }
    throw new Error(error.message);
  }

  db.runSync(`DELETE FROM organizations WHERE id = ?;`, [id]);
}
