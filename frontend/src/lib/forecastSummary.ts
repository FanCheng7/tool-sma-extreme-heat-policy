import type { ForecastPoint, RiskLevel } from "@/domain/risk";

/**
 * One hour of the forecast, expressed for a screen-reader text alternative.
 *
 * `time` is a display label (for example `2 PM`), `level` the risk band, and
 * `displayValue` the raw risk score rounded to the precision the chart tooltip
 * already uses, so both surfaces read the same number.
 */
export interface ForecastSummaryRow {
  time: string;
  level: RiskLevel;
  displayValue: number;
}

/**
 * Structured source for a forecast chart's text alternative.
 *
 * Holds no copy: the caller turns these values into sentences through i18n so
 * the summary stays translatable. `peak` is the highest-risk row of the day,
 * `first` and `last` the day's opening and closing rows. All three are null
 * when the day has no points.
 */
export interface ForecastSummary {
  rows: ForecastSummaryRow[];
  peak: ForecastSummaryRow | null;
  first: ForecastSummaryRow | null;
  last: ForecastSummaryRow | null;
}

/**
 * Derives the screen-reader summary for one forecast day (issue #71).
 *
 * The UI feeds these values into `charts.forecast.a11y.*`:
 * `chartLabel` for the one-line `aria-label`, and `tableCaption` plus the
 * `timeHeader` / `levelHeader` / `valueHeader` column labels for the visually
 * hidden hourly table.
 *
 * TODO(#71): implement. Ties should resolve to the earliest row so the peak is
 * reported at the time it is first reached.
 */
export function buildForecastSummary(points: ForecastPoint[]): ForecastSummary {
  throw new Error(
    `buildForecastSummary is not implemented yet (received ${points.length} points).`,
  );
}
