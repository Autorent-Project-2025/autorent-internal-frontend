import { isAxiosError } from "axios";
import { normalizeTicketDetails, normalizeTicketPage, } from "@/entities/ticket/mappers";
import { apiClient } from "./http";
function buildListParams(filters) {
    const params = {
        page: filters.page,
        pageSize: filters.pageSize,
    };
    if (filters.type) {
        params.type = filters.type;
    }
    return params;
}
export async function getAllTickets(filters) {
    const response = await apiClient.get("/tickets", {
        params: buildListParams(filters),
    });
    return normalizeTicketPage(response.data);
}
export async function getTicketDetails(type, id) {
    const response = await apiClient.get(`/tickets/${type}/${id}`);
    return normalizeTicketDetails(response.data, type);
}
export async function updateTicket(type, payload) {
    await apiClient.patch(`/tickets/${type}/update`, payload);
}
export async function approveAccountRegisterTicket(id) {
    await apiClient.post(`/tickets/account-register/${id}/approve`, {});
}
export async function probeInternalAccess() {
    try {
        await apiClient.get("/tickets", {
            params: { page: 1, pageSize: 1 },
        });
        return true;
    }
    catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
            return false;
        }
        throw error;
    }
}
