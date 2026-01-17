// Refilla/types/station.ts

export type FilterStatus = "GREEN" | "YELLOW" | "RED" | "NA"
export type StationStatus = "PENDING" | "ACTIVE" | "REMOVED"

export type Station = {

    id: string;
    lat: number; // latitude
    lng: number; // longitude

    buildingAbre: string;    // Abreviation of the building name
    buildingName: string;    // Name that bottle refiller is in
    buildingDetails: string; // Where the station is located in the building

    filterStatus: FilterStatus;   // Filter life of station
    stationStatus: StationStatus; // whether station is working or not

    bottlesSaved: number; // number of 8oz bottles saved
    lastUpdated: string;  // ISO String

}