export type TicketApiType = "AccountRegister" | "BookingCancel" | "Withdrawal";
export type TicketRouteType = "account-register" | "booking-cancel" | "withdrawal";
export type TicketStatus = 0 | 1 | 2;

export interface RelatedAccountInfo {
  name: string;
  ownerUserId: number;
  registrationDate: string;
}

export interface TicketListItem {
  id: number;
  title: string;
  description: string;
  ownerEmail: string;
  type: TicketApiType;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string | null;
  managerComments: string | null;
}

export interface TicketDetails extends TicketListItem {
  bookingId: number | null;
  withdrawalAmount: number | null;
  relatedAccount: RelatedAccountInfo | null;
}

export interface TicketPage {
  items: TicketListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
