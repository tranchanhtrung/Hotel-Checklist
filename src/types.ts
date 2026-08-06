export type ItemStatus = 'PASS' | 'FAIL' | 'MAINTENANCE' | 'NA';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED';
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL' | 'PUBLIC_AREA' | 'KITCHEN' | 'RESTAURANT' | 'RESTROOM' | 'OUTDOOR';
export type RoomStatus = 'READY' | 'INSPECTING' | 'NEEDS_MAINTENANCE' | 'CLEANING';

export interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  standardRequirement: string;
  weight: number; // 1 to 5
  requiresPhotoOnFail?: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  iconName?: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  hotelRating: '3_STAR' | '4_STAR' | '5_STAR' | 'CUSTOM';
  targetRoomType: RoomType | 'ALL';
  categories: ChecklistCategory[];
  createdAt: string;
  isDefault?: boolean;
}

export interface InspectionItemResult {
  itemId: string;
  categoryId: string;
  title: string;
  status: ItemStatus;
  severity?: SeverityLevel;
  score: number; // 0 for FAIL, 100 for PASS, etc.
  notes?: string;
  photoUrls?: string[]; // Base64 or Blob URLs
  aiRecommendation?: string;
}

export interface InspectionReport {
  id: string;
  reportCode: string; // e.g. INS-20260805-101
  hotelName: string;
  roomNumber: string;
  roomType: RoomType;
  inspectorName: string;
  inspectorRole: string;
  templateId: string;
  templateName: string;
  inspectionDate: string; // ISO string
  overallScore: number; // Percentage 0-100
  qualityGrade: 'XUẤT SẮC' | 'ĐẠT CHUẨN' | 'CẦN CẢI THIỆN' | 'KHÔNG ĐẠT';
  results: InspectionItemResult[];
  summaryNotes?: string;
  aiExecutiveSummary?: string;
  inspectorSignature?: string; // base64 data URL
  driveFileId?: string;
  driveFileUrl?: string;
  driveSyncedAt?: string;
  emailSentTo?: string[];
  emailSentAt?: string;
  status: 'DRAFT' | 'COMPLETED' | 'ARCHIVED';
}

export interface MaintenanceTicket {
  id: string;
  ticketCode: string; // e.g. TKT-101-01
  inspectionReportId: string;
  roomNumber: string;
  categoryTitle: string;
  itemTitle: string;
  description: string;
  severity: SeverityLevel;
  status: TicketStatus;
  assigneeName?: string;
  assigneeDepartment?: 'Housekeeping' | 'Engineering' | 'IT' | 'Front Desk';
  reportedDate: string;
  targetCompletionDate?: string;
  completedDate?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  resolutionNotes?: string;
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  lastInspectedDate?: string;
  lastScore?: number;
  housekeeperName?: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  autoUploadDrive: boolean;
  reportTime: string; // "17:00"
  lastRunAt?: string;
}
