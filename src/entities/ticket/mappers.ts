import type {
  RelatedAccountInfo,
  TicketApiType,
  TicketDetails,
  TicketListItem,
  TicketPage,
  TicketRouteType,
  TicketStatus,
} from "./types";

const routeToApiTypeMap: Record<TicketRouteType, TicketApiType> = {
  "account-register": "AccountRegister",
  "booking-cancel": "BookingCancel",
  withdrawal: "Withdrawal",
};

const apiToRouteTypeMap: Record<TicketApiType, TicketRouteType> = {
  AccountRegister: "account-register",
  BookingCancel: "booking-cancel",
  Withdrawal: "withdrawal",
};

const ticketTypeNames: Record<TicketApiType, string> = {
  AccountRegister: "Account Register",
  BookingCancel: "Booking Cancel",
  Withdrawal: "Withdrawal",
};

const ticketStatusNames: Record<TicketStatus, string> = {
  0: "Pending",
  1: "Approved",
  2: "Declined",
};

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function toNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string" && raw.trim().length > 0) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toString(raw: unknown, fallback = ""): string {
  if (typeof raw === "string") {
    return raw;
  }

  if (raw === undefined || raw === null) {
    return fallback;
  }

  return String(raw);
}

function normalizeType(raw: unknown): TicketApiType {
  if (raw === "AccountRegister" || raw === "BookingCancel" || raw === "Withdrawal") {
    return raw;
  }

  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (normalized === "accountregister" || normalized === "account-register") {
      return "AccountRegister";
    }

    if (normalized === "bookingcancel" || normalized === "booking-cancel") {
      return "BookingCancel";
    }

    if (normalized === "withdrawal") {
      return "Withdrawal";
    }
  }

  return "AccountRegister";
}

function normalizeStatus(raw: unknown): TicketStatus {
  const value = toNumber(raw, 0);
  if (value === 1) {
    return 1;
  }

  if (value === 2) {
    return 2;
  }

  return 0;
}

function normalizeRelatedAccount(raw: unknown): RelatedAccountInfo | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const related = raw as Record<string, unknown>;
  return {
    name: toString(pick(related, "name", "Name"), ""),
    ownerUserId: toNumber(pick(related, "ownerUserId", "OwnerUserId"), 0),
    registrationDate: toString(
      pick(related, "registrationDate", "RegistrationDate"),
      "",
    ),
  };
}

export function toRouteTicketType(type: TicketApiType): TicketRouteType {
  return apiToRouteTypeMap[type];
}

export function toApiTicketType(raw: string | null | undefined): TicketApiType | undefined {
  if (!raw) {
    return undefined;
  }

  const normalized = normalizeType(raw);
  return normalized;
}

export function routeTypeToApiType(type: TicketRouteType): TicketApiType {
  return routeToApiTypeMap[type];
}

export function isRouteTicketType(raw: string): raw is TicketRouteType {
  return raw === "account-register" || raw === "booking-cancel" || raw === "withdrawal";
}

export function ticketTypeLabel(type: TicketApiType): string {
  return ticketTypeNames[type];
}

export function ticketStatusLabel(status: TicketStatus): string {
  return ticketStatusNames[status];
}

export function normalizeTicketListItem(raw: unknown): TicketListItem {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    id: toNumber(pick(source, "id", "ticketId", "Id", "TicketId"), 0),
    title: toString(pick(source, "title", "Title"), "Untitled"),
    description: toString(pick(source, "description", "Description"), ""),
    ownerEmail: toString(pick(source, "ownerEmail", "OwnerEmail"), ""),
    type: normalizeType(pick(source, "type", "Type")),
    status: normalizeStatus(pick(source, "status", "Status")),
    createdAt: toString(pick(source, "createdAt", "CreatedAt"), ""),
    updatedAt: toString(pick(source, "updatedAt", "UpdatedAt"), "") || null,
    managerComments:
      toString(pick(source, "managerComments", "ManagerComments"), "") || null,
  };
}

export function normalizeTicketDetails(raw: unknown, routeType: TicketRouteType): TicketDetails {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const baseTicket = normalizeTicketListItem(source);
  const mappedType = routeTypeToApiType(routeType);
  const rawType = pick(source, "type", "Type");
  return {
    ...baseTicket,
    type: rawType ? normalizeType(rawType) : mappedType,
    bookingId: toNumber(pick(source, "bookingId", "BookingId"), 0) || null,
    withdrawalAmount:
      toNumber(pick(source, "withdrawalAmount", "WithdrawalAmount"), 0) || null,
    relatedAccount: normalizeRelatedAccount(pick(source, "relatedAccount", "RelatedAccount")),
  };
}

export function normalizeTicketPage(raw: unknown): TicketPage {
  const payload = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const dataNode = payload.data;
  const source =
    typeof dataNode === "object" && dataNode !== null
      ? (dataNode as Record<string, unknown>)
      : payload;

  const rawItems = pick(source, "items", "Items", "tickets", "Tickets");
  const items = Array.isArray(rawItems)
    ? rawItems.map((item) => normalizeTicketListItem(item))
    : [];

  const page = toNumber(pick(source, "page", "Page", "currentPage", "CurrentPage"), 1);
  const pageSize = toNumber(
    pick(source, "pageSize", "PageSize", "size", "Size"),
    Math.max(1, items.length),
  );
  const totalCount = toNumber(
    pick(source, "totalCount", "TotalCount", "count", "Count"),
    items.length,
  );
  const totalPages = Math.max(
    1,
    toNumber(pick(source, "totalPages", "TotalPages"), Math.ceil(totalCount / pageSize)),
  );

  return {
    items,
    page: Math.max(1, page),
    pageSize: Math.max(1, pageSize),
    totalCount: Math.max(0, totalCount),
    totalPages,
  };
}
