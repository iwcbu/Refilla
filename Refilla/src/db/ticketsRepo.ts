// src/db/ticketsRepo.ts

import { db } from "./database";

export type TicketRow = {
  id: number;
  station_id: number;
  title: string;
  body: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function listTicketsForStation(stationId: number): TicketRow[] {
  return db.getAllSync<TicketRow>(
    `SELECT * FROM tickets WHERE station_id = ? ORDER BY id DESC;`,
    [stationId]
  );
}

export function createTicket(input: {
  stationId: number;
  title: string;
  body?: string;
  status?: string;
}): number {
  const res = db.runSync(
    `INSERT INTO tickets (station_id, title, body, status)
     VALUES (?, ?, ?, ?);`,
    [input.stationId, input.title, input.body ?? null, input.status ?? "OPEN"]
  );
  return res.lastInsertRowId;
}

export function updateTicket(
  id: number,
  patch: Partial<Pick<TicketRow, "title" | "body" | "status">>
) {
  db.runSync(
    `UPDATE tickets SET
      title = COALESCE(?, title),
      body = COALESCE(?, body),
      status = COALESCE(?, status),
      updated_at = datetime('now')
     WHERE id = ?;`,
    [patch.title ?? null, patch.body ?? null, patch.status ?? null, id]
  );
}

export function deleteTicket(id: number) {
  db.runSync(`DELETE FROM tickets WHERE id = ?;`, [id]);
}
