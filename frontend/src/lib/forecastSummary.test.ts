import { describe, expect, it } from "vitest";
import { createInstance } from "i18next";
import { buildForecastSummary } from "@/lib/forecastSummary";
import en from "@/i18n/locales/en/translation.json";
import zh from "@/i18n/locales/zh-CN/translation.json";

describe("buildForecastSummary", () => {
  it("returns null endpoints for an empty day", () => {
    expect(buildForecastSummary([])).toEqual({
      rows: [],
      peak: null,
      first: null,
      last: null,
    });
  });
  it("uses a single point for every endpoint", () => {
    const row = { time: "2:30 PM", level: "high", displayValue: 3.2 };
    expect(buildForecastSummary([{ time: "14:30", value: 3.24 }])).toEqual({
      rows: [row],
      peak: row,
      first: row,
      last: row,
    });
  });
  it("preserves detail, risk thresholds and endpoints without changing input", () => {
    const points = [
      { time: "00:00", value: 1.9 },
      { time: "06:00", value: 2 },
      { time: "12:00", value: 3 },
      { time: "18:00", value: 4 },
      { time: "23:00", value: 2.5 },
    ];
    const original = structuredClone(points);
    points.forEach(Object.freeze);
    Object.freeze(points);
    const result = buildForecastSummary(points);
    expect(result.rows.map((row) => row.level)).toEqual([
      "low",
      "moderate",
      "high",
      "extreme",
      "moderate",
    ]);
    expect(result.rows.map((row) => row.time)).toEqual([
      "12 AM",
      "6 AM",
      "12 PM",
      "6 PM",
      "11 PM",
    ]);
    expect(result.peak).toEqual(result.rows[3]);
    expect(result.first).toEqual(result.rows[0]);
    expect(result.last).toEqual(result.rows[4]);
    expect(points).toEqual(original);
  });
  it("compares raw scores and keeps the first equal maximum", () => {
    const result = buildForecastSummary([
      { time: "09:00", value: 3.21 },
      { time: "10:00", value: 3.24 },
      { time: "11:00", value: 3.24 },
    ]);
    expect(result.peak).toEqual({
      time: "10 AM",
      level: "high",
      displayValue: 3.2,
    });
  });
  it("rounds the value without rounding into a higher risk band", () => {
    expect(buildForecastSummary([{ time: "12:00", value: 2.99 }]).peak).toEqual(
      { time: "12 PM", level: "moderate", displayValue: 3 },
    );
  });
  it("matches chart time fallbacks across midnight and invalid labels", () => {
    expect(
      buildForecastSummary([
        { time: "23:00", value: 2 },
        { time: "00:00", value: 2 },
        { time: "invalid", value: 2 },
      ]).rows.map((row) => row.time),
    ).toEqual(["11 PM", "12 AM", "1 AM"]);
    expect(
      buildForecastSummary([{ time: "invalid", value: 1 }]).first?.time,
    ).toBe("12 AM");
  });
});

describe("forecast accessibility translations", () => {
  it.each(["en", "zh-CN"])(
    "renders summary and table labels in %s",
    async (language) => {
      const i18n = createInstance();
      await i18n.init({
        lng: language,
        resources: { en: { translation: en }, "zh-CN": { translation: zh } },
      });
      const level = i18n.t("risk.level.high");
      const label = i18n.t("charts.forecast.a11y.chartLabel", {
        day: "2026-09-19",
        peakLevel: level,
        peakTime: "12 PM",
        startLevel: level,
        endLevel: level,
      });
      expect(label).toContain("2026-09-19");
      expect(label).toContain("12 PM");
      expect(label).toContain(level);
      expect(label).not.toMatch(/\{\{|undefined|charts\.forecast/);
      expect(
        i18n.t("charts.forecast.a11y.tableCaption", { day: "2026-09-19" }),
      ).toContain("2026-09-19");
      for (const key of ["timeHeader", "levelHeader", "valueHeader"]) {
        expect(i18n.exists(`charts.forecast.a11y.${key}`)).toBe(true);
      }
    },
  );
});
