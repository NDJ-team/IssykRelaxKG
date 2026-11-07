export const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Подтверждено", color: "var(--turquoise)", bg: "var(--turquoise-light)" },
  confirmed: { label: "Подтверждено", color: "var(--turquoise)", bg: "var(--turquoise-light)" },
  pending: { label: "Ожидает", color: "var(--sand)", bg: "var(--sand-light)" },
  checked_in: { label: "Заселение", color: "var(--lake-blue)", bg: "var(--lake-blue-light)" },
  cancelled: { label: "Отменено", color: "#ef4444", bg: "#fee2e2" },
  completed: { label: "Завершено", color: "var(--text-secondary)", bg: "var(--surface)" },
};
