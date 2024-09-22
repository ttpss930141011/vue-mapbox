// Props
export interface MapProps {
    lng: number;
    lat: number;
    zoom: number;
    bearing: number;
    pitch: number;
}

export interface Building {
    id: string;
    name?: string;
    type: string;
    yearBuilt: number;
    area: number;
    marketPrice: number;
    rent: number;
}