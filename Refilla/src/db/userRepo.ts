// src/db/userRepo.ts

import { db } from "./database";

export type UserRow = {
  id: number;
  username: string;
  profile_key: string;
  avatar_emoji: string;
  points: number;
  created_at: string;
  updated_at: string;
};

function buildProfileKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listUsers(): UserRow[] {
    return db.getAllSync<UserRow>(
        `SELECT * FROM users ORDER BY id;`
    );
}

export function listUsersByPoints(): UserRow[] {
    return db.getAllSync<UserRow>(
        `SELECT * FROM users ORDER BY points DESC, username COLLATE NOCASE ASC, id ASC;`
    );
}

export function getUser(id: number): UserRow | null {
    return (
        db.getFirstSync<UserRow>(
            `SELECT * FROM users WHERE id = ?;`, 
            [ id ]
        ) ?? null
    );
}

export function getUserByUsername(username: string): UserRow | null {
    return (
        db.getFirstSync<UserRow>(
            `SELECT * FROM users WHERE username = ?;`, 
            [ username ]
        ) ?? null
    );
}

export function createUser(username: string, avatarEmoji = "🙂"): number {
    const profileKey = buildProfileKey();
    const res = db.runSync(
        `INSERT INTO users (username, profile_key, avatar_emoji) VALUES (?, ?, ?);`,
        [username, profileKey, avatarEmoji]
    );
    return res.lastInsertRowId;
}

export function updateUser(
    id: number,
    patch: {
        username?: string | null;
        profile_key?: string | null;
        avatar_emoji?: string | null;
        points?: number | null;
    }
): void {
    db.runSync(
        `UPDATE users SET
            username = COALESCE(?, username),
            profile_key = COALESCE(?, profile_key),
            avatar_emoji = COALESCE(?, avatar_emoji),
            points = COALESCE(?, points),
            updated_at = datetime('now')
        WHERE id = ?;`,
        [patch.username ?? null, patch.profile_key ?? null, patch.avatar_emoji ?? null, patch.points ?? null, id]
    );
}

export function incrementUserPoints(id: number, delta: number): void {
    db.runSync(
        `UPDATE users
         SET points = points + ?,
             updated_at = datetime('now')
         WHERE id = ?;`,
        [delta, id]
    );
}

export function deleteUser(id: number): void {
    db.runSync(`DELETE FROM users WHERE id = ?;`, [id]);
}
