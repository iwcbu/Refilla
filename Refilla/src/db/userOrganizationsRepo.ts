import { db } from "./database";
import type { OrganizationRow } from "./organizationRepo";

export type UserOrganizationRow = {
  user_id: number;
  org_id: number;
  role: string;
  joined_at: string;
};

export function listOrganizationIdsForUser(userId: number): number[] {
  const rows = db.getAllSync<{ org_id: number }>(
    `SELECT org_id
     FROM user_organizations
     WHERE user_id = ?
     ORDER BY joined_at ASC;`,
    [userId]
  );

  return rows.map((row) => row.org_id);
}

export function listOrganizationsForUser(userId: number): OrganizationRow[] {
  return db.getAllSync<OrganizationRow>(
    `SELECT o.*
     FROM user_organizations uo
     JOIN organizations o ON o.id = uo.org_id
     WHERE uo.user_id = ?
     ORDER BY o.name COLLATE NOCASE ASC;`,
    [userId]
  );
}

export function isUserInOrganization(userId: number, orgId: number): boolean {
  const row = db.getFirstSync<{ org_id: number }>(
    `SELECT org_id
     FROM user_organizations
     WHERE user_id = ? AND org_id = ?
     LIMIT 1;`,
    [userId, orgId]
  );

  return row != null;
}

export function joinOrganization(userId: number, orgId: number, role = "MEMBER"): void {
  db.runSync(
    `INSERT OR IGNORE INTO user_organizations (user_id, org_id, role)
     VALUES (?, ?, ?);`,
    [userId, orgId, role]
  );
}

export function leaveOrganization(userId: number, orgId: number): void {
  db.runSync(
    `DELETE FROM user_organizations
     WHERE user_id = ? AND org_id = ?;`,
    [userId, orgId]
  );
}

export function toggleOrganizationMembership(userId: number, orgId: number): boolean {
  if (isUserInOrganization(userId, orgId)) {
    leaveOrganization(userId, orgId);
    return false;
  }

  joinOrganization(userId, orgId);
  return true;
}
