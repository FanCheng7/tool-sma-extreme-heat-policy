import { toRiskLevel, type ForecastPoint, type RiskLevel } from "@/domain/risk";
import {
  formatForecastMinutesLabel,
  toForecastMinuteOffsets,
} from "@/lib/forecastTime";

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
 * Points retain their forecast order. Ties resolve to the first occurrence,
 * comparing raw scores before rounding. Time offsets follow the chart, including
 * its hourly fallback for labels that do not advance (for example at midnight).
 */
export function buildForecastSummary(points: ForecastPoint[]): ForecastSummary {
  const minuteOffsets = toForecastMinuteOffsets(
    points.map((point) => point.time),
  );
  let peakIndex = -1;
  const rows = points.map((point, index): ForecastSummaryRow => {
    if (peakIndex === -1 || point.value > points[peakIndex].value) {
      peakIndex = index;
    }

    return {
      time: formatForecastMinutesLabel(minuteOffsets[index]),
      level: toRiskLevel(point.value),
      displayValue: Number(point.value.toFixed(1)),
    };
  });

  return {
    rows,
    peak: rows[peakIndex] ?? null,
    first: rows[0] ?? null,
    last: rows.at(-1) ?? null,
  };
}
