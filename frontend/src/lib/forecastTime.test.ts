import { describe, expect, it } from "vitest";
import {
  formatForecastMinutesLabel,
  parseForecastTimeToMinutes,
  toForecastMinuteOffsets,
} from "@/lib/forecastTime";

describe("parseForecastTimeToMinutes", () => {
  it("returns minutes past midnight for well-formed labels", () => {
    expect(parseForecastTimeToMinutes("00:00")).toBe(0);
    expect(parseForecastTimeToMinutes("14:30")).toBe(870);
    expect(parseForecastTimeToMinutes("23:59")).toBe(1439);
  });

  it("rejects labels outside the 24-hour format", () => {
    expect(parseForecastTimeToMinutes("24:00")).toBeNull();
    expect(parseForecastTimeToMinutes("9:00")).toBeNull();
    expect(parseForecastTimeToMinutes("")).toBeNull();
  });
});

describe("formatForecastMinutesLabel", () => {
  it("formats whole hours without minutes", () => {
    expect(formatForecastMinutesLabel(0)).toBe("12 AM");
    expect(formatForecastMinutesLabel(720)).toBe("12 PM");
    expect(formatForecastMinutesLabel(1380)).toBe("11 PM");
  });

  it("keeps minutes and wraps past a full day", () => {
    expect(formatForecastMinutesLabel(870)).toBe("2:30 PM");
    expect(formatForecastMinutesLabel(1500)).toBe("1 AM");
  });
});

describe("toForecastMinuteOffsets", () => {
  it("keeps parsed offsets while they advance", () => {
    expect(toForecastMinuteOffsets(["08:00", "09:00", "10:30"])).toEqual([
      480, 540, 630,
    ]);
  });

  it("advances by an hour when a label wraps past midnight", () => {
    expect(toForecastMinuteOffsets(["22:00", "23:00", "00:00"])).toEqual([
      1320, 1380, 1440,
    ]);
  });

  it("advances by an hour when a label is malformed", () => {
    expect(toForecastMinuteOffsets(["08:00", "broken", "10:00"])).toEqual([
      480, 540, 600,
    ]);
  });

  it("starts at midnight when the first label is malformed", () => {
    expect(toForecastMinuteOffsets(["broken", "01:00"])).toEqual([0, 60]);
  });

  it("returns nothing for an empty day", () => {
    expect(toForecastMinuteOffsets([])).toEqual([]);
  });
});
