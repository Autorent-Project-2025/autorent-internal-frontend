export function formatDateTime(value) {
    if (!value) {
        return "Not set";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
export function formatMoney(value) {
    if (value === null || Number.isNaN(value)) {
        return "Not set";
    }
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
}
