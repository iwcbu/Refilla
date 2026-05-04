import { db } from "./database";
import { getUser } from "./userRepo";
import {
  buildMissingTableError,
  isMissingSupabaseTableMessage,
  requireSupabase,
} from "../lib/sharedData";

export type TicketRow = {
  id: number;
  user_id: number | null;
  author_profile_key: string | null;
  author_username: string | null;
  author_avatar_emoji: string | null;
  station_id: number;
  title: string;
  body: string | null;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

function upsertTicket(row: TicketRow) {
  db.runSync(
    `INSERT OR REPLACE INTO tickets
      (id, user_id, author_profile_key, author_username, author_avatar_emoji, station_id, title, body, status, category, priority, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      row.id,
      row.user_id,
      row.author_profile_key,
      row.author_username,
      row.author_avatar_emoji,
      row.station_id,
      row.title,
      row.body,
      row.status,
      row.category,
      row.priority,
      row.created_at,
      row.updated_at,
    ]
  );
}

export function listTickets(): TicketRow[] {
  return db.getAllSync<TicketRow>(`SELECT * FROM tickets ORDER BY id;`);
}

export function listTicketsForStation(stationId: number): TicketRow[] {
  return db.getAllSync<TicketRow>(
    `SELECT * FROM tickets WHERE station_id = ? ORDER BY id;`,
    [stationId]
  );
}

export function listTicketsForUser(userId: number): TicketRow[] {
  const user = getUser(userId);
  if (!user?.profile_key) {
    return [];
  }

  return db.getAllSync<TicketRow>(
    `SELECT * FROM tickets WHERE author_profile_key = ? ORDER BY updated_at DESC, id DESC;`,
    [user.profile_key]
  );
}

export function countTicketsForUser(userId: number): number {
  const user = getUser(userId);
  if (!user?.profile_key) {
    return 0;
  }

  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM tickets WHERE author_profile_key = ?;`,
    [user.profile_key]
  );

  return Number(row?.count ?? 0);
}

export function getTicketById(id: number): TicketRow | null {
  return (
    db.getFirstSync<TicketRow>(`SELECT * FROM tickets WHERE id = ?;`, [id]) ??
    null
  );
}

export async function syncTickets(): Promise<TicketRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("tickets").select("*").order("id");

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      console.log(buildMissingTableError("tickets").message);
      return listTickets();
    }
    throw new Error(error.message);
  }

  const tickets = (data ?? []) as TicketRow[];
  const nextIds = new Set(tickets.map((ticket) => ticket.id));

  for (const ticket of tickets) {
    upsertTicket(ticket);
  }

  const currentIds = db.getAllSync<{ id: number }>(`SELECT id FROM tickets;`);
  for (const row of currentIds) {
    if (!nextIds.has(row.id)) {
      db.runSync(`DELETE FROM tickets WHERE id = ?;`, [row.id]);
    }
  }

  return listTickets();
}

export async function createTicket(input: {
  user_id: number;
  author_profile_key?: string | null;
  author_username?: string | null;
  author_avatar_emoji?: string | null;
  station_id: number;
  title: string;
  body?: string | null;
  status?: string;
  category?: string;
  priority?: string;
}): Promise<number> {
  const user = getUser(input.user_id);
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      user_id: input.user_id,
      author_profile_key: input.author_profile_key ?? user?.profile_key ?? null,
      author_username: input.author_username ?? user?.username ?? null,
      author_avatar_emoji: input.author_avatar_emoji ?? user?.avatar_emoji ?? null,
      station_id: input.station_id,
      title: input.title,
      body: input.body ?? null,
      status: input.status ?? "OPEN",
      category: input.category ?? "OTHER",
      priority: input.priority ?? "MEDIUM",
    })
    .select("*")
    .single();

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("tickets");
    }
    throw new Error(error.message);
  }

  upsertTicket(data as TicketRow);
  return Number(data.id);
}

export async function updateTicket(
  id: number,
  patch: Partial<Pick<TicketRow, "title" | "body" | "status" | "category" | "priority">>
): Promise<number> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("tickets");
    }
    throw new Error(error.message);
  }

  upsertTicket(data as TicketRow);
  return 1;
}

export async function deleteTicket(id: number): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) {
    if (isMissingSupabaseTableMessage(error.message)) {
      throw buildMissingTableError("tickets");
    }
    throw new Error(error.message);
  }

  db.runSync(`DELETE FROM tickets WHERE id = ?;`, [id]);
}
