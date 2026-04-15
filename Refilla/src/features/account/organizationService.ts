import {
  createOrg,
  getOrgbyNameContains,
  listOrgs,
  type OrganizationRow,
} from "../../db/organizationRepo";
import {
  joinOrganization,
  listOrganizationIdsForUser,
  listOrganizationsForUser,
} from "../../db/userOrganizationsRepo";
import type { StationRow } from "../../db/stationsRepo";

export function getVisibleStationsForOrgIds(
  stations: StationRow[],
  organizationIds: number[]
) {
  const membershipSet = new Set(organizationIds);

  return stations.filter(
    (station) =>
      station.organization_id == null || membershipSet.has(station.organization_id)
  );
}

export function getVisibleStationsForUser(
  stations: StationRow[],
  userId: number | null | undefined
) {
  if (userId == null) {
    return stations.filter((station) => station.organization_id == null);
  }

  return getVisibleStationsForOrgIds(stations, listOrganizationIdsForUser(userId));
}

export function canUserAccessStation(
  station: Pick<StationRow, "organization_id">,
  userId: number | null | undefined
) {
  if (station.organization_id == null) {
    return true;
  }

  if (userId == null) {
    return false;
  }

  return listOrganizationIdsForUser(userId).includes(station.organization_id);
}

export function getOrganizationSummaryForUser(userId: number) {
  const organizations = listOrganizationsForUser(userId);

  return {
    organizations,
    count: organizations.length,
  };
}

export function ensureOrganization(name: string): OrganizationRow {
  throw new Error("ensureOrganization is now async. Use ensureOrganizationAsync instead.");
}

export async function ensureOrganizationAsync(name: string): Promise<OrganizationRow> {
  const normalizedName = name.trim();
  const existingOrganization = await getOrgbyNameContains(normalizedName);

  if (existingOrganization && existingOrganization.name.toLowerCase() === normalizedName.toLowerCase()) {
    return existingOrganization;
  }

  const orgId = await createOrg(normalizedName);
  const organizations = await listOrgs();
  const organization = organizations.find((org) => org.id === orgId);

  if (!organization) {
    throw new Error("Could not create organization.");
  }

  return organization;
}

export async function createAndJoinOrganization(userId: number, name: string) {
  const organization = await ensureOrganizationAsync(name);
  joinOrganization(userId, organization.id);
  return organization;
}
