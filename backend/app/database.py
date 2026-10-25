import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from .config import settings

logger = logging.getLogger("railrakshak.database")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".data")
STORE_FILE = os.path.join(DATA_DIR, "railrakshak_store.json")

class DatabaseManager:
    def __init__(self):
        self.db_type: str = "PENDING"
        self.is_connected: bool = False
        self.notice: str = ""
        self.mongo_client: Optional[MongoClient] = None
        self.mongo_db = None
        
        # Local persistent store collections (in-memory with file persistence)
        self._local_store: Dict[str, List[Dict[str, Any]]] = {
            "journeys": [],
            "incidents": [],
            "officer_duties": []
        }

    def connect(self):
        """Attempts to connect to MongoDB, falling back transparently to LOCAL_DEMO_STORE."""
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            # Ping database to verify connection
            client.admin.command('ping')
            
            self.mongo_client = client
            self.mongo_db = client[settings.DATABASE_NAME]
            self.db_type = "MONGODB"
            self.is_connected = True
            self.notice = f"Connected to production/development MongoDB at {settings.MONGODB_URI} (Database: {settings.DATABASE_NAME})"
            logger.info(self.notice)

            # Ensure indexes
            self._ensure_mongo_indexes()
            self._seed_demo_officers_if_empty()
            self._seed_demo_incidents_if_empty()
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as err:
            logger.warning(f"MongoDB connection failed: {err}")
            self.db_type = "LOCAL_DEMO_STORE"
            self.is_connected = True
            self.notice = (
                f"MongoDB not detected at {settings.MONGODB_URI}. "
                "Operating in explicitly labeled LOCAL_DEMO_STORE mode for development. "
                "Data is persisted to local storage at backend/.data/railrakshak_store.json. "
                "To connect to live MongoDB, start MongoDB or update MONGODB_URI in backend/.env."
            )
            logger.info(self.notice)
            self._init_local_store()

    def _ensure_mongo_indexes(self):
        if self.mongo_db is not None:
            self.mongo_db.journeys.create_index([("journey_id", ASCENDING)], unique=True)
            self.mongo_db.journeys.create_index([("created_at", DESCENDING)])
            self.mongo_db.incidents.create_index([("incident_id", ASCENDING)], unique=True)
            self.mongo_db.incidents.create_index([("status", ASCENDING)])
            self.mongo_db.incidents.create_index([("created_at", DESCENDING)])
            self.mongo_db.officer_duties.create_index([("duty_id", ASCENDING)], unique=True)
            self.mongo_db.officer_duties.create_index([("status", ASCENDING)])

    def _init_local_store(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(STORE_FILE):
            try:
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    self._local_store = json.load(f)
            except Exception as e:
                logger.error(f"Error loading local store: {e}")
                self._local_store = {"journeys": [], "incidents": [], "officer_duties": []}
        else:
            self._save_local_store()
            
        self._seed_demo_officers_if_empty()
        self._seed_demo_incidents_if_empty()

    def _save_local_store(self):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump(self._local_store, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving local store: {e}")

    # ---------------- ID Generators ----------------
    def get_next_id(self, prefix: str, collection_name: str, id_field: str) -> str:
        current_year = datetime.now(timezone.utc).year
        count = 0
        if self.db_type == "MONGODB":
            count = self.mongo_db[collection_name].count_documents({})
        else:
            count = len(self._local_store.get(collection_name, []))
        return f"RR-{prefix}-{current_year}-{(count + 1):04d}"

    # ---------------- Journey Operations ----------------
    def insert_journey(self, journey_dict: Dict[str, Any]) -> Dict[str, Any]:
        if self.db_type == "MONGODB":
            self.mongo_db.journeys.insert_one(journey_dict)
            doc = self.mongo_db.journeys.find_one({"journey_id": journey_dict["journey_id"]}, {"_id": 0})
            return doc
        else:
            self._local_store["journeys"].insert(0, journey_dict)
            self._save_local_store()
            return journey_dict

    def get_journey(self, journey_id: str) -> Optional[Dict[str, Any]]:
        if self.db_type == "MONGODB":
            return self.mongo_db.journeys.find_one({"journey_id": journey_id}, {"_id": 0})
        else:
            for j in self._local_store["journeys"]:
                if j.get("journey_id") == journey_id:
                    return j
            return None

    # ---------------- Incident Operations ----------------
    def insert_incident(self, incident_dict: Dict[str, Any]) -> Dict[str, Any]:
        if self.db_type == "MONGODB":
            self.mongo_db.incidents.insert_one(incident_dict)
            doc = self.mongo_db.incidents.find_one({"incident_id": incident_dict["incident_id"]}, {"_id": 0})
            return doc
        else:
            self._local_store["incidents"].insert(0, incident_dict)
            self._save_local_store()
            return incident_dict

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        if self.db_type == "MONGODB":
            return self.mongo_db.incidents.find_one({"incident_id": incident_id}, {"_id": 0})
        else:
            for inc in self._local_store["incidents"]:
                if inc.get("incident_id") == incident_id:
                    return inc
            return None

    def list_incidents(
        self,
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        if self.db_type == "MONGODB":
            query = {}
            if status:
                query["status"] = status
            if category:
                query["category"] = category
            if search:
                regex_pattern = {"$regex": search, "$options": "i"}
                query["$or"] = [
                    {"incident_id": regex_pattern},
                    {"journey_snapshot.train_number": regex_pattern},
                    {"affected_person.full_name": regex_pattern},
                    {"journey_snapshot.boarding_station": regex_pattern},
                    {"journey_snapshot.destination_station": regex_pattern}
                ]
            cursor = self.mongo_db.incidents.find(query, {"_id": 0}).sort("created_at", DESCENDING).skip(skip).limit(limit)
            return list(cursor)
        else:
            results = list(self._local_store["incidents"])
            if status:
                results = [i for i in results if i.get("status") == status]
            if category:
                results = [i for i in results if i.get("category") == category]
            if search:
                q = search.lower()
                results = [
                    i for i in results
                    if q in i.get("incident_id", "").lower()
                    or q in str(i.get("journey_snapshot", {}).get("train_number", "")).lower()
                    or q in str(i.get("affected_person", {}).get("full_name", "")).lower()
                    or q in str(i.get("journey_snapshot", {}).get("boarding_station", "")).lower()
                    or q in str(i.get("journey_snapshot", {}).get("destination_station", "")).lower()
                ]
            # Sort newest first
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return results[skip : skip + limit]

    def update_incident_status(
        self,
        incident_id: str,
        new_status: str,
        updated_by: str,
        notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        now_iso = datetime.now(timezone.utc).isoformat() + "Z"
        current = self.get_incident(incident_id)
        if not current:
            return None

        old_status = current.get("status")
        transition = {
            "from_status": old_status,
            "to_status": new_status,
            "timestamp": now_iso,
            "updated_by": updated_by,
            "notes": notes
        }

        if self.db_type == "MONGODB":
            self.mongo_db.incidents.update_one(
                {"incident_id": incident_id},
                {
                    "$set": {"status": new_status, "updated_at": now_iso},
                    "$push": {"status_history": transition}
                }
            )
            return self.get_incident(incident_id)
        else:
            for inc in self._local_store["incidents"]:
                if inc.get("incident_id") == incident_id:
                    inc["status"] = new_status
                    inc["updated_at"] = now_iso
                    if "status_history" not in inc:
                        inc["status_history"] = []
                    inc["status_history"].append(transition)
                    self._save_local_store()
                    return inc
            return None

    # ---------------- Officer Operations ----------------
    def insert_officer_duty(self, duty_dict: Dict[str, Any]) -> Dict[str, Any]:
        if self.db_type == "MONGODB":
            self.mongo_db.officer_duties.insert_one(duty_dict)
            doc = self.mongo_db.officer_duties.find_one({"duty_id": duty_dict["duty_id"]}, {"_id": 0})
            return doc
        else:
            self._local_store["officer_duties"].insert(0, duty_dict)
            self._save_local_store()
            return duty_dict

    def list_officers_on_duty(self, train_or_area: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.db_type == "MONGODB":
            query = {"status": "ON_DUTY"}
            if train_or_area:
                query["assigned_train_or_area"] = {"$regex": train_or_area, "$options": "i"}
            cursor = self.mongo_db.officer_duties.find(query, {"_id": 0}).sort("created_at", DESCENDING)
            return list(cursor)
        else:
            officers = [o for o in self._local_store["officer_duties"] if o.get("status") == "ON_DUTY"]
            if train_or_area:
                q = train_or_area.lower()
                officers = [o for o in officers if q in o.get("assigned_train_or_area", "").lower()]
            return officers

    def match_officers_for_incident(self, train_number: Optional[str], boarding: Optional[str], destination: Optional[str]) -> List[Dict[str, Any]]:
        """Matches on-duty officers against train number or route area."""
        all_on_duty = self.list_officers_on_duty()
        matches = []
        for officer in all_on_duty:
            assigned = officer.get("assigned_train_or_area", "").strip().lower()
            reason = None
            if train_number and train_number.strip().lower() in assigned:
                reason = f"Officer assigned to Train #{train_number}"
            elif boarding and boarding.strip().lower() in assigned:
                reason = f"Officer assigned to sector covering {boarding}"
            elif destination and destination.strip().lower() in assigned:
                reason = f"Officer assigned to sector covering {destination}"
            elif "general" in assigned or "division" in assigned or "control" in assigned:
                reason = "Zonal railway safety officer on duty"
                
            if reason:
                matches.append({
                    "officer": officer,
                    "potential_match": True,
                    "match_reason": reason,
                    "disclaimer": "Potential match based on reported train or area. Not a confirmed assignment or dispatch."
                })
        return matches

    def _seed_demo_officers_if_empty(self):
        """Seed initial demonstration officers so the authority view has immediate operational context."""
        existing = []
        if self.db_type == "MONGODB":
            existing = list(self.mongo_db.officer_duties.find({"is_demo": True}))
        else:
            existing = [o for o in self._local_store["officer_duties"] if o.get("is_demo")]
            
        if not existing:
            demo_officers = [
                {
                    "duty_id": "RR-OFF-2026-0001",
                    "officer_name": "Insp. Vikram Singh (DEMO)",
                    "staff_id": "RPF-NDLS-8841",
                    "designation": "RPF Sub-Inspector",
                    "duty_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "shift": "MORNING",
                    "assigned_train_or_area": "Train 12004 / Northern Sector",
                    "coach": "Coaches A1-B4",
                    "duty_start_time": "06:00",
                    "duty_end_time": "14:00",
                    "contact_number": "9876501122",
                    "status": "ON_DUTY",
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "duty_id": "RR-OFF-2026-0002",
                    "officer_name": "Head Constable Sunita Rao (DEMO)",
                    "staff_id": "RPF-CNB-3319",
                    "designation": "RPF Escort Constable",
                    "duty_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "shift": "AFTERNOON",
                    "assigned_train_or_area": "Train 12951 / Kanpur Division",
                    "coach": "Coaches B1-B6",
                    "duty_start_time": "14:00",
                    "duty_end_time": "22:00",
                    "contact_number": "9876503344",
                    "status": "ON_DUTY",
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "duty_id": "RR-OFF-2026-0003",
                    "officer_name": "Sub-Insp. Manoj Tiwari (DEMO)",
                    "staff_id": "RPF-DLI-9923",
                    "designation": "RPF Safety Squad Sub-Inspector",
                    "duty_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "shift": "AFTERNOON",
                    "assigned_train_or_area": "Train 12302 / Kanpur Central",
                    "coach": "AC Coaches A1-B3",
                    "duty_start_time": "14:00",
                    "duty_end_time": "22:00",
                    "contact_number": "9811223344",
                    "status": "ON_DUTY",
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "duty_id": "RR-OFF-2026-0004",
                    "officer_name": "Station Supt. A. K. Banerjee (DEMO)",
                    "staff_id": "IR-HQ-7721",
                    "designation": "Chief Safety Controller",
                    "duty_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "shift": "FULL_DAY",
                    "assigned_train_or_area": "Central Control Division",
                    "coach": None,
                    "duty_start_time": "08:00",
                    "duty_end_time": "20:00",
                    "contact_number": "9876505566",
                    "status": "ON_DUTY",
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "duty_id": "RR-OFF-2026-0005",
                    "officer_name": "Constable Rajesh Kumar (DEMO)",
                    "staff_id": "RPF-NDLS-1044",
                    "designation": "Platform & Train Escort Squad",
                    "duty_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "shift": "NIGHT",
                    "assigned_train_or_area": "New Delhi Railway Station / All Platforms",
                    "coach": "Platforms 1-16",
                    "duty_start_time": "22:00",
                    "duty_end_time": "06:00",
                    "contact_number": "9876507788",
                    "status": "ON_DUTY",
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                }
            ]
            for do in demo_officers:
                self.insert_officer_duty(do)

    def _seed_demo_incidents_if_empty(self):
        """Seed permanent demonstration incidents so Control Room always displays comprehensive live operations."""
        existing = []
        if self.db_type == "MONGODB":
            existing = list(self.mongo_db.incidents.find({"is_demo": True}))
        else:
            existing = [i for i in self._local_store["incidents"] if i.get("is_demo")]

        if not existing:
            demo_journeys = [
                {
                    "journey_id": "RR-JRN-2026-0001",
                    "traveler_type": "SOLO",
                    "primary_passenger": {
                        "full_name": "Rajesh Sharma",
                        "mobile_number": "9876543210",
                        "age": 29,
                        "gender": "Male",
                        "emergency_contact_name": "Kavita Sharma",
                        "emergency_contact_mobile": "9876501234"
                    },
                    "group_members": [],
                    "train_number": "12004",
                    "train_name": "Lucknow Swarna Shatabdi Express",
                    "boarding_station": "New Delhi (NDLS)",
                    "destination_station": "Lucknow Jn (LJN)",
                    "journey_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "coach": "C2",
                    "seat": "45",
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "journey_id": "RR-JRN-2026-0002",
                    "traveler_type": "GROUP",
                    "primary_passenger": {
                        "full_name": "Priya Patel",
                        "mobile_number": "9811223344",
                        "age": 36,
                        "gender": "Female",
                        "emergency_contact_name": "Amit Patel",
                        "emergency_contact_mobile": "9822334455"
                    },
                    "group_members": [
                        {
                            "member_id": "mem-aarav",
                            "full_name": "Aarav Patel",
                            "relationship": "Son",
                            "age": 7,
                            "gender": "Male",
                            "assistance_needs": "Child vigilance"
                        }
                    ],
                    "train_number": "12951",
                    "train_name": "Mumbai Tejas Rajdhani Express",
                    "boarding_station": "New Delhi (NDLS)",
                    "destination_station": "Mumbai Central (BCT)",
                    "journey_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "coach": "B3",
                    "seat": "12",
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "journey_id": "RR-JRN-2026-0003",
                    "traveler_type": "SOLO",
                    "primary_passenger": {
                        "full_name": "Shanti Devi",
                        "mobile_number": "9811998877",
                        "age": 72,
                        "gender": "Female",
                        "emergency_contact_name": "Ramesh Kumar",
                        "emergency_contact_mobile": "9811998800"
                    },
                    "group_members": [],
                    "train_number": "12302",
                    "train_name": "Howrah Rajdhani Express",
                    "boarding_station": "New Delhi (NDLS)",
                    "destination_station": "Kanpur Central (CNB)",
                    "journey_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "coach": "A1",
                    "seat": "18",
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                }
            ]

            for dj in demo_journeys:
                self.insert_journey(dj)

            demo_incidents = [
                {
                    "incident_id": "RR-INC-2026-0001",
                    "journey_id": "RR-JRN-2026-0001",
                    "journey_snapshot": {
                        "train_number": "12004",
                        "train_name": "Lucknow Swarna Shatabdi Express",
                        "boarding_station": "New Delhi (NDLS)",
                        "destination_station": "Lucknow Jn (LJN)",
                        "coach": "C2",
                        "seat": "45"
                    },
                    "affected_person": {
                        "full_name": "Rajesh Sharma",
                        "relationship": "Primary Passenger (Self)",
                        "member_id": None,
                        "assistance_needs": "Self"
                    },
                    "category": "UNWELL",
                    "status": "IN_PROGRESS",
                    "description": "Passenger experienced sudden dizziness and acute respiratory tightness after departing Ghaziabad. First aid requested.",
                    "location": {
                        "latitude": 28.6692,
                        "longitude": 77.4538,
                        "accuracy_meters": 15.0,
                        "last_updated_at": datetime.now(timezone.utc).isoformat() + "Z",
                        "available": True,
                        "permission_status": "granted",
                        "manual_station": "Ghaziabad Jn (GZB)"
                    },
                    "status_history": [
                        {
                            "from_status": "ACTIVE",
                            "to_status": "ACTIVE",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Passenger Mobile SOS",
                            "notes": "Emergency alert transmitted from Coach C2 Seat 45"
                        },
                        {
                            "from_status": "ACTIVE",
                            "to_status": "ACKNOWLEDGED",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Control Room Operator",
                            "notes": "Distress verified. Medical emergency team on alert."
                        },
                        {
                            "from_status": "ACKNOWLEDGED",
                            "to_status": "IN_PROGRESS",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Central Operations",
                            "notes": "Escort Sub-Insp. Vikram Singh dispatched to Coach C2 with medical kit."
                        }
                    ],
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "incident_id": "RR-INC-2026-0002",
                    "journey_id": "RR-JRN-2026-0002",
                    "journey_snapshot": {
                        "train_number": "12951",
                        "train_name": "Mumbai Tejas Rajdhani Express",
                        "boarding_station": "New Delhi (NDLS)",
                        "destination_station": "Mumbai Central (BCT)",
                        "coach": "B3",
                        "seat": "12"
                    },
                    "affected_person": {
                        "full_name": "Aarav Patel",
                        "relationship": "Son (7 yrs)",
                        "member_id": "mem-aarav",
                        "assistance_needs": "Child vigilance"
                    },
                    "category": "LOST_OR_SEPARATED",
                    "status": "ACKNOWLEDGED",
                    "description": "7-year-old child wandered towards pantry vestibule near Coach B4 while parent was at seat.",
                    "location": {
                        "latitude": 28.5823,
                        "longitude": 77.2341,
                        "accuracy_meters": 20.0,
                        "last_updated_at": datetime.now(timezone.utc).isoformat() + "Z",
                        "available": True,
                        "permission_status": "granted",
                        "manual_station": "Hazrat Nizamuddin (NZM)"
                    },
                    "status_history": [
                        {
                            "from_status": "ACTIVE",
                            "to_status": "ACTIVE",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Passenger Mobile SOS",
                            "notes": "Child separated notification sent by mother"
                        },
                        {
                            "from_status": "ACTIVE",
                            "to_status": "ACKNOWLEDGED",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Control Room",
                            "notes": "Head Constable Sunita Rao tasked to search B-coaches"
                        }
                    ],
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                },
                {
                    "incident_id": "RR-INC-2026-0003",
                    "journey_id": "RR-JRN-2026-0003",
                    "journey_snapshot": {
                        "train_number": "12302",
                        "train_name": "Howrah Rajdhani Express",
                        "boarding_station": "New Delhi (NDLS)",
                        "destination_station": "Kanpur Central (CNB)",
                        "coach": "A1",
                        "seat": "18"
                    },
                    "affected_person": {
                        "full_name": "Shanti Devi",
                        "relationship": "Primary Passenger (Self)",
                        "member_id": None,
                        "assistance_needs": "Wheelchair / Elderly Mobility"
                    },
                    "category": "URGENT_ASSISTANCE",
                    "status": "ACTIVE",
                    "description": "Senior citizen traveler requests platform wheelchair and porter assistance upon arrival at Kanpur Central.",
                    "location": {
                        "latitude": 26.4538,
                        "longitude": 80.3508,
                        "accuracy_meters": None,
                        "last_updated_at": datetime.now(timezone.utc).isoformat() + "Z",
                        "available": False,
                        "permission_status": "prompt",
                        "manual_station": "Kanpur Central (CNB)"
                    },
                    "status_history": [
                        {
                            "from_status": "ACTIVE",
                            "to_status": "ACTIVE",
                            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                            "updated_by": "Passenger Portal",
                            "notes": "Request for station deboarding wheelchair logged"
                        }
                    ],
                    "is_demo": True,
                    "created_at": datetime.now(timezone.utc).isoformat() + "Z",
                    "updated_at": datetime.now(timezone.utc).isoformat() + "Z"
                }
            ]

            for di in demo_incidents:
                self.insert_incident(di)

db = DatabaseManager()
