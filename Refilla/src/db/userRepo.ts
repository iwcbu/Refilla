// src/db/userRepo.ts

import { db } from "./database";
import {
    buildMissingTableError,
    isMissingSupabaseTableMessage,
    requireSupabase,
} from "../lib/sharedData";

export type UserRow = {
  id: number;
  auth_user_id: string | null;
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

export function getUserByAuthId(authUserId: string): UserRow | null {
    return (
        db.getFirstSync<UserRow>(
            `SELECT * FROM users WHERE auth_user_id = ?;`,
            [ authUserId ]
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

export function upsertUserProfile(input: {
    auth_user_id: string;
    username: string;
    avatar_emoji?: string | null;
    points?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}): UserRow {
    const existing = getUserByAuthId(input.auth_user_id);
    const username = input.username.trim();
    const avatarEmoji = input.avatar_emoji ?? "🙂";
    const points = input.points ?? 0;
    const createdAt = input.created_at ?? new Date().toISOString();
    const updatedAt = input.updated_at ?? new Date().toISOString();

    if (existing) {
        db.runSync(
            `UPDATE users SET
                username = ?,
                profile_key = ?,
                auth_user_id = ?,
                avatar_emoji = ?,
                points = ?,
                created_at = COALESCE(created_at, ?),
                updated_at = ?
            WHERE id = ?;`,
            [
                username,
                input.auth_user_id,
                input.auth_user_id,
                avatarEmoji,
                points,
                createdAt,
                updatedAt,
                existing.id,
            ]
        );

        return getUser(existing.id) as UserRow;
    }

    const res = db.runSync(
        `INSERT INTO users (auth_user_id, username, profile_key, avatar_emoji, points, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
            input.auth_user_id,
            username,
            input.auth_user_id,
            avatarEmoji,
            points,
            createdAt,
            updatedAt,
        ]
    );

    return getUser(res.lastInsertRowId) as UserRow;
}

export function updateUser(
    id: number,
    patch: {
        username?: string | null;
        auth_user_id?: string | null;
        profile_key?: string | null;
        avatar_emoji?: string | null;
        points?: number | null;
    }
): void {
    db.runSync(
        `UPDATE users SET
            username = COALESCE(?, username),
            auth_user_id = COALESCE(?, auth_user_id),
            profile_key = COALESCE(?, profile_key),
            avatar_emoji = COALESCE(?, avatar_emoji),
            points = COALESCE(?, points),
            updated_at = datetime('now')
        WHERE id = ?;`,
        [patch.username ?? null, patch.auth_user_id ?? null, patch.profile_key ?? null, patch.avatar_emoji ?? null, patch.points ?? null, id]
    );
}

export function incrementUserPoints(id: number, delta: number): void {
    const user = getUser(id);
    db.runSync(
        `UPDATE users
         SET points = points + ?,
             updated_at = datetime('now')
         WHERE id = ?;`,
        [delta, id]
    );

    if (user?.auth_user_id) {
        const nextPoints = (user.points ?? 0) + delta;
        void requireSupabase()
            .from("profiles")
            .update({
                points: nextPoints,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.auth_user_id)
            .then(({ error }) => {
                if (error && !isMissingSupabaseTableMessage(error.message)) {
                    console.log("Could not sync profile points", error.message);
                }
            });
    }
}

export function deleteUser(id: number): void {
    db.runSync(`DELETE FROM users WHERE id = ?;`, [id]);
}

export async function syncProfiles(): Promise<UserRow[]> {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false });

    if (error) {
        if (isMissingSupabaseTableMessage(error.message)) {
            console.log(buildMissingTableError("profiles").message);
            return listUsersByPoints();
        }
        throw new Error(error.message);
    }

    const rows = (data ?? []) as Array<{
        id: string;
        username: string;
        avatar_emoji?: string | null;
        points?: number | null;
        created_at?: string | null;
        updated_at?: string | null;
    }>;

    for (const row of rows) {
        upsertUserProfile({
            auth_user_id: row.id,
            username: row.username,
            avatar_emoji: row.avatar_emoji ?? "🙂",
            points: row.points ?? 0,
            created_at: row.created_at ?? null,
            updated_at: row.updated_at ?? null,
        });
    }

    return listUsersByPoints();
}

export async function updateRemoteProfile(authUserId: string, patch: {
    username?: string | null;
    avatar_emoji?: string | null;
    points?: number | null;
}): Promise<void> {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from("profiles")
        .update({
            username: patch.username ?? undefined,
            avatar_emoji: patch.avatar_emoji ?? undefined,
            points: patch.points ?? undefined,
            updated_at: new Date().toISOString(),
        })
        .eq("id", authUserId)
        .select("*")
        .single();

    if (error) {
        if (isMissingSupabaseTableMessage(error.message)) {
            throw buildMissingTableError("profiles");
        }
        throw new Error(error.message);
    }

    upsertUserProfile({
        auth_user_id: data.id,
        username: data.username,
        avatar_emoji: data.avatar_emoji ?? "🙂",
        points: data.points ?? 0,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null,
    });
}
