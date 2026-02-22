// src/db/ticketsRepo.ts

import { db } from "./database";

export type TicketRow = {
  id: number;
  user_id: number,
  station_id: number;

  title: string;
  body: string | null;
  status: string;

  category: string,
  priority: string;

  created_at: string;
  updated_at: string;
};

export function listTickets(): TicketRow[] {
  return db.getAllSync<TicketRow>(`SELECT * FROM tickets ORDER BY id;`);
}

export function listTicketsForStation(stationId: number): TicketRow[] {
  return db.getAllSync<TicketRow>(
    `SELECT * FROM tickets WHERE station_id = ? ORDER BY id;`,
    [stationId]
  );
}

export function getTicketById(id: number): TicketRow | null {
  return (
    db.getFirstSync<TicketRow>(`SELECT * FROM tickets WHERE id = ?;`, [id]) ??
    null
  );
}

export function createTicket(input: {
  user_id: number,
  station_id: number;
  title: string;
  body?: string | null;
  status?: string;
  category?: string;
  priority?: string;
}): number {
  const res = db.runSync(
    `INSERT INTO tickets (user_id, station_id, title, body, status, category, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.user_id, 
      input.station_id, 
      input.title, 
      input.body ?? null, 
      input.status ?? "OPEN", 
      input.category ?? "OTHER", 
      input.priority ?? "MEDIUM",
    ]
  );
  return res.lastInsertRowId;
}

export function updateTicket(
  id: number,
  patch: Partial<Pick<TicketRow, "title" | "body" | "status" | "category" | "priority">>
) {
  db.runSync(
    `UPDATE tickets SET
      title = COALESCE(?, title),
      body = COALESCE(?, body),
      status = COALESCE(?, status),
      category = COALESCE(?, category),
      priority = COALESCE(?, priority)
      updated_at = datetime('now'),
     WHERE id = ?;`,
    [
      patch.title ?? null, 
      patch.body ?? null, 
      patch.status ?? null, 
      patch.category ?? null,
      patch.priority ?? null,
      id
    ]
  );
}

export function deleteTicket(id: number) {
  db.runSync(`DELETE FROM tickets WHERE id = ?;`, [id]);
}
