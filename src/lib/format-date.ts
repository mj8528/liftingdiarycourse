import { format } from "date-fns";

export function formatDate(date: Date): string {
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${day}${ordinal} ${format(date, "MMM yyyy")}`;
}
