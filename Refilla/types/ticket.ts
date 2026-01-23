// types/station.ts

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketCategory = "LEAK" | "BROKEN" | "FILTER" | "NEW LOCATION" | "OTHER";

export type CreateTicketPayload = {
  stationId?: string; // if existing station
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  photoUris?: string[];
};

export type CreateStationPayload = {
  buildingAbre: string;
  buildingName: string;
  buildingDetails: string;
  lat?: number;
  lng?: number;
};