import { isAxiosError } from "axios";
import {
  normalizeTicketDetails,
  normalizeTicketPage,
} from "@/entities/ticket/mappers";
import type {
  TicketApiType,
  TicketDetails,
  TicketPage,
  TicketRouteType,
  TicketStatus,
} from "@/entities/ticket/types";
import { apiClient } from "./http";

export interface TicketListFilters {
  type?: TicketApiType;
  page: number;
  pageSize: number;
}

export interface UpdateTicketPayload {
  ticketId: number;
  status: TicketStatus;
  managerComments: string;
}

function buildListParams(filters: TicketListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    pageSize: filters.pageSize,
  };

  if (filters.type) {
    params.type = filters.type;
  }

  return params;
}

export async function getAllTickets(filters: TicketListFilters): Promise<TicketPage> {
  const response = await apiClient.get("/tickets", {
    params: buildListParams(filters),
  });
  return normalizeTicketPage(response.data);
}

export async function getTicketDetails(
  type: TicketRouteType,
  id: number,
): Promise<TicketDetails> {
  const response = await apiClient.get(`/tickets/${type}/${id}`);
  return normalizeTicketDetails(response.data, type);
}

export async function updateTicket(
  type: TicketRouteType,
  payload: UpdateTicketPayload,
): Promise<void> {
  await apiClient.patch(`/tickets/${type}/update`, payload);
}

export async function approveAccountRegisterTicket(id: number): Promise<void> {
  await apiClient.post(`/tickets/account-register/${id}/approve`, {});
}

export async function probeInternalAccess(): Promise<boolean> {
  try {
    await apiClient.get("/tickets", {
      params: { page: 1, pageSize: 1 },
    });
    return true;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 403) {
      return false;
    }

    throw error;
  }
}
