export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface InstructionStep {
  stepNumber: number;
  text: string;
  imageUrl?: string;
}

export interface Landmark {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface IDepartment {
  _id?: string;
  name: string;
  slug: string;
  shortName: string;
  description?: string;
  buildingName: string;
  location: Coordinate;
  entranceLocation: Coordinate;
  floor: string;
  roomNumber: string;
  roomLocation: Coordinate;
  instructions: InstructionStep[];
  landmarks?: Landmark[];
  images?: string[];
  buildingId?: string;
  entranceId?: string;
  classroomId?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
