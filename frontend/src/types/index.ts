export type TravelerType = 'SOLO' | 'GROUP';

export type IncidentCategory =
  | 'UNWELL'
  | 'LOST_OR_SEPARATED'
  | 'PERSONAL_SAFETY_CONCERN'
  | 'URGENT_ASSISTANCE'
  | 'OTHER';

export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export type OfficerShift = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY';

export type OfficerDutyStatus = 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';

export interface PassengerInfo {
  full_name: string;
  mobile_number: string;
  age: number;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
}

export interface GroupMemberInfo {
  member_id: string;
  full_name: string;
  relationship: string;
  age?: number;
  gender?: string;
  assistance_needs?: string;
}

export interface JourneyCreate {
  traveler_type: TravelerType;
  primary_passenger: PassengerInfo;
  group_members: GroupMemberInfo[];
  train_number: string;
  train_name?: string;
  boarding_station: string;
  destination_station: string;
  journey_date: string;
  coach?: string;
  seat?: string;
  expected_arrival_time?: string;
}

export interface JourneyResponse extends JourneyCreate {
  journey_id: string;
  created_at: string;
  updated_at: string;
}

export interface LocationTelemetry {
  latitude?: number | null;
  longitude?: number | null;
  accuracy_meters?: number | null;
  last_updated_at?: string | null;
  available: boolean;
  permission_status: 'prompt' | 'granted' | 'denied' | 'unavailable' | 'unsupported';
  manual_station?: string | null;
}

export interface AffectedPersonInfo {
  full_name: string;
  relationship?: string;
  member_id?: string;
  assistance_needs?: string;
}

export interface IncidentCreate {
  journey_id: string;
  affected_person: AffectedPersonInfo;
  category: IncidentCategory;
  description?: string;
  location: LocationTelemetry;
  is_demo?: boolean;
}

export interface StatusTransition {
  from_status: IncidentStatus;
  to_status: IncidentStatus;
  timestamp: string;
  updated_by: string;
  notes?: string;
}

export interface IncidentResponse {
  incident_id: string;
  journey_id: string;
  affected_person: AffectedPersonInfo;
  category: IncidentCategory;
  description?: string;
  location: LocationTelemetry;
  status: IncidentStatus;
  status_history: StatusTransition[];
  journey_snapshot?: {
    train_number?: string;
    train_name?: string;
    boarding_station?: string;
    destination_station?: string;
    coach?: string;
    seat?: string;
    primary_passenger?: PassengerInfo;
  };
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentStatusUpdate {
  status: IncidentStatus;
  updated_by?: string;
  notes?: string;
}

export interface OfficerDutyCreate {
  officer_name: string;
  staff_id: string;
  designation: string;
  duty_date: string;
  shift: OfficerShift;
  assigned_train_or_area: string;
  coach?: string;
  duty_start_time: string;
  duty_end_time: string;
  contact_number?: string;
  status: OfficerDutyStatus;
  is_demo: boolean;
}

export interface OfficerDutyResponse extends OfficerDutyCreate {
  duty_id: string;
  created_at: string;
  updated_at: string;
}

export interface OfficerMatchResponse {
  officer: OfficerDutyResponse;
  potential_match: boolean;
  match_reason: string;
  disclaimer: string;
}

export interface SystemHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  database: {
    type: 'MONGODB' | 'LOCAL_DEMO_STORE' | string;
    connected: boolean;
    notice: string;
  };
  version: string;
  disclaimer: string;
}
