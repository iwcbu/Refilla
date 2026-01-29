// types/station.ts

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketCategory = "LEAK" | "BROKEN" | "FILTER" | "NEW LOCATION" | "OTHER";



export type CreateTicketPayload = {

    stationId?: string;
    title: string;                // Title for ticket
    description: string;          // Desription for ticket
    category: TicketCategory;     // The category of what the ticket is for
    priority: TicketPriority;     // The priority of tickets, only will be availabe to faculty or building staff
    photoUris?: string[];         // attachments for tickets, only will be availabe to faculty or building staff
};

export type CreateStationPayload = {

    // lattitude and longitude of station
    lat?: number;
    lng?: number;
    
    buildingAbre: string;       // Abreviation of the building the station resides     
    buildingName: string;       // Name of the building the station resides
    buildingDetails: string;    // Directions inside the building on the location of the station
};