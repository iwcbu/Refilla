// src/features/account/accountService.ts

import { countFavoriteStationsForUser } from "../../db/favoriteStationsRepo";
import { listStations } from "../../db/stationsRepo";
import { countTicketsForUser, listTicketsForUser } from "../../db/ticketsRepo";
import { listUsersByPoints, type UserRow } from "../../db/userRepo";
import { listOrganizationsForUser } from "../../db/userOrganizationsRepo";

export type LeaderboardEntry = UserRow & {
  rank: number;
  ticketsSubmitted: number;
  favoriteStations: number;
};

export function getLeaderboard(): LeaderboardEntry[] {
  return listUsersByPoints().map((user, index) => ({
    ...user,
    rank: index + 1,
    ticketsSubmitted: countTicketsForUser(user.id),
    favoriteStations: countFavoriteStationsForUser(user.id),
  }));
}

export function getUserRank(userId: number): number | null {
  const leaderboard = getLeaderboard();
  return leaderboard.find((entry) => entry.id === userId)?.rank ?? null;
}

export function getAccountSummary(userId: number) {
  const ticketsSubmitted = countTicketsForUser(userId);
  const favoriteStations = countFavoriteStationsForUser(userId);
  const totalStations = listStations().length;
  const organizations = listOrganizationsForUser(userId);
  const leaderboard = getLeaderboard();
  const rank = leaderboard.find((entry) => entry.id === userId)?.rank ?? null;

  return {
    ticketsSubmitted,
    favoriteStations,
    totalStations,
    organizations,
    organizationCount: organizations.length,
    rank,
    totalUsers: leaderboard.length,
  };
}

export function getRecentTicketsForUser(userId: number) {
  return listTicketsForUser(userId);
}
