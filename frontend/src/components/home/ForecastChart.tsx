import { Box, VisuallyHidden } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ForecastPoint } from "@/domain/risk";
import { createRiskLevelLabels } from "@/domain/riskLabels";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";
import { buildForecastSummary } from "@/lib/forecastSummary";
import { bindForecastHoverPoint, buildForecastOption } from "@/lib/riskCharts";
import { EChart } from "@/components/ui/EChart";

const DEFAULT_FORECAST_CHART_HEIGHT = 340;
const MOBILE_FORECAST_CHART_HEIGHT = 280;
const FORECAST_DISPLAY_PRECISION = 1;

interface ForecastChartProps {
  points: ForecastPoint[];
  dayLabel: string;
}

/**
 * Renders one forecast day as an ECharts canvas with a screen-reader only text
 * alternative: a one-line summary plus the hour-by-hour values.
 *
 * `role="img"` makes the wrapper's subtree presentational, so the hourly table
 * is a sibling of that wrapper rather than a child; nested inside it, assistive
 * technology would skip the table entirely.
 */
export function ForecastChart({ points, dayLabel }: ForecastChartProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobileViewport();
  const riskLevelLong = createRiskLevelLabels((key) => t(key), "long");
  const { rows, peak, first, last } = buildForecastSummary(points);
  const hasTextAlternative = peak !== null && first !== null && last !== null;

  const chartOption = buildForecastOption(
    points,
    {
      xAxisName: t("charts.forecast.xAxisName"),
      yAxisRiskName: t("charts.forecast.yAxisRiskName"),
      tooltipRiskLabel: t("charts.forecast.tooltipRiskLabel"),
      riskLevelLong,
    },
    undefined,
    isMobile,
  );

  return (
    <>
      <Box
        role={hasTextAlternative ? "img" : undefined}
        aria-label={
          hasTextAlternative
            ? t("charts.forecast.a11y.chartLabel", {
                day: dayLabel,
                peakLevel: riskLevelLong[peak.level],
                peakTime: peak.time,
                startLevel: riskLevelLong[first.level],
                endLevel: riskLevelLong[last.level],
              })
            : undefined
        }
      >
        <EChart
          option={chartOption}
          height={
            isMobile
              ? MOBILE_FORECAST_CHART_HEIGHT
              : DEFAULT_FORECAST_CHART_HEIGHT
          }
          bindChart={(chart, container) =>
            bindForecastHoverPoint(chart, container, points)
          }
        />
      </Box>

      {hasTextAlternative ? (
        <VisuallyHidden component="table">
          <caption>
            {t("charts.forecast.a11y.tableCaption", { day: dayLabel })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("charts.forecast.a11y.timeHeader")}</th>
              <th scope="col">{t("charts.forecast.a11y.levelHeader")}</th>
              <th scope="col">{t("charts.forecast.a11y.valueHeader")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <th scope="row">{row.time}</th>
                <td>{riskLevelLong[row.level]}</td>
                <td>{row.displayValue.toFixed(FORECAST_DISPLAY_PRECISION)}</td>
              </tr>
            ))}
          </tbody>
        </VisuallyHidden>
      ) : null}
    </>
  );
}
