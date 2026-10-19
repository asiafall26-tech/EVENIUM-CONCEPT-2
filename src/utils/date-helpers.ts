/**
 * Evenium Event Date & Auto-Closure Helpers
 * Rules:
 * 1. Event has a celebration date (start date) and optional end date.
 * 2. The event auto-terminates exactly 7 days after the end date.
 */

export interface EventDatesInfo {
  eventDateFormatted: string;
  endDateFormatted: string;
  closingDateFormatted: string;
  closingDateShort: string;
  daysSinceEnd: number;
  daysLeftUntilClosing: number;
  isOverSevenDays: boolean;
  isPassed: boolean;
}

export function computeEventDates(dateStr?: string, endDateStr?: string): EventDatesInfo {
  if (!dateStr) {
    return {
      eventDateFormatted: "Non définie",
      endDateFormatted: "Non définie",
      closingDateFormatted: "Non définie",
      closingDateShort: "N/A",
      daysSinceEnd: 0,
      daysLeftUntilClosing: 7,
      isOverSevenDays: false,
      isPassed: false,
    };
  }

  const startDate = new Date(dateStr);
  const isValidStart = !isNaN(startDate.getTime());

  if (!isValidStart) {
    return {
      eventDateFormatted: dateStr,
      endDateFormatted: dateStr,
      closingDateFormatted: "Date invalide",
      closingDateShort: "N/A",
      daysSinceEnd: 0,
      daysLeftUntilClosing: 7,
      isOverSevenDays: false,
      isPassed: false,
    };
  }

  const rawEndDate = endDateStr ? new Date(endDateStr) : startDate;
  const endDate = isNaN(rawEndDate.getTime()) ? startDate : rawEndDate;

  // Auto-closing date is exactly 7 days after the end date
  const closingDate = new Date(endDate);
  closingDate.setDate(closingDate.getDate() + 7);

  const now = new Date();
  const nowDayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endDayTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  const closingDayTime = new Date(closingDate.getFullYear(), closingDate.getMonth(), closingDate.getDate()).getTime();

  const daysSinceEnd = Math.floor((nowDayTime - endDayTime) / (1000 * 60 * 60 * 24));
  const daysLeftUntilClosing = Math.max(0, Math.floor((closingDayTime - nowDayTime) / (1000 * 60 * 60 * 24)));

  return {
    eventDateFormatted: startDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    endDateFormatted: endDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    closingDateFormatted: closingDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    closingDateShort: closingDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    daysSinceEnd,
    daysLeftUntilClosing,
    isOverSevenDays: daysSinceEnd >= 7,
    isPassed: daysSinceEnd >= 0,
  };
}
