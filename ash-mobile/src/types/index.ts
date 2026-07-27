export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  lastLoginAt: string | null;
}

export interface Challan {
  _id: string;
  challanNumber: string;
  challanSequence: number;
  truckNumber: string;
  placeOfDelivery: string;
  driverName: string | null;
  challanDate: string;
  challanTime: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedReason: string | null;
  createdBy: string;
  updatedBy: string | null;
  printCount: number;
  lastPrintedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DurationFilter = 'today' | 'week' | 'month' | 'year' | 'custom' | '';

export interface ChallanQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  challanNumber?: string;
  truckNumber?: string;
  placeOfDelivery?: string;
  duration?: DurationFilter;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface DashboardStats {
  todayTrips?: number;
  todayChallans?: number;
  monthlyTrips?: number;
  yearlyTrips?: number;
  recentChallans?: Challan[];
  latestActivity?: Challan[];
}

export interface AppSettings {
  key: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  copiesPerPrint: number;
  printerType: 'ESCPOS' | 'USB_RAW';
  printerName: string;
  printerWidthMm: number;
  printerCalibration: Record<string, number>;
}

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  performedBy?: { name: string } | null;
  reason?: string | null;
  createdAt: string;
}

export interface ExportPreview {
  count: number;
  columns: string[];
  rows: Record<string, unknown>[];
}
