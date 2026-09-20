const FORECAST_HOUR_MINUTE_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Parses a backend `HH:MM` forecast label into minutes past local midnight.
 *
 * Returns null when the label is not a well-formed 24-hour time.
 */
export function parseForecastTimeToMinutes(rawTime: string): number | null {
  const match = FORECAST_HOUR_MINUTE_PATTERN.exec(rawTime);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Formats minutes past local midnight as a 12-hour label, wrapping across days.
 */
export function formatForecastMinutesLabel(rawMinutes: number): string {
  const roundedMinutes = Math.round(rawMinutes);
  const minutesInDay = 24 * 60;
  const normalizedMinutes =
    ((roundedMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour24 = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  if (minute === 0) {
    return `${hour12} ${meridiem}`;
  }

  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

/**
 * Maps a day's `HH:MM` forecast labels onto minutes past local midnight.
 *
 * A label that is malformed, or that does not advance on the previous one
 * (a day wrapping past midnight, for example), falls back to one hour after
 * its predecessor, so the sequence stays strictly increasing and plottable.
 */
export function toForecastMinuteOffsets(times: readonly string[]): number[] {
  let previousMinuteOffset = -1;

  return times.map((time) => {
    const parsedMinuteOffset = parseForecastTimeToMinutes(time);
    const minuteOffset =
      parsedMinuteOffset !== null && parsedMinuteOffset > previousMinuteOffset
        ? parsedMinuteOffset
        : previousMinuteOffset < 0
          ? (parsedMinuteOffset ?? 0)
          : previousMinuteOffset + 60;

    previousMinuteOffset = minuteOffset;

    return minuteOffset;
  });
}
