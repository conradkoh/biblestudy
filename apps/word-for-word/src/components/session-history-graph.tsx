import React from "react";
import { View } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TText } from "@/src/components/core/TText";
import { formatDate } from "date-fns";
import classNames from "classnames";

interface SessionHistoryData {
  date: string;
  count: number;
}

interface SessionHistoryGraphProps {
  data: SessionHistoryData[];
  size?: number;
  spacing?: number;
  xLabelSize?: number;
  legend?: boolean;
  axisLabels?: boolean;
}

const SessionHistoryGraph: React.FC<SessionHistoryGraphProps> = ({
  data,
  size = 10,
  spacing = 1,
  xLabelSize = 6,
  legend = true,
  axisLabels = true,
}) => {
  const themeColors = useThemeColors();

  // Calculate the number of weeks to display
  const weeks = 4;
  const daysPerWeek = 7;

  // Get today's date in YYYY-MM-DD format
  const today = formatDate(new Date(), "yyyy-MM-dd");

  // Helper function to parse date string
  const parseDateStr = (dateStr: string): [number, number, number] => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) {
      throw new Error("Invalid date string format");
    }
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      throw new Error("Invalid date string format");
    }
    return [year, month, day];
  };

  // Calculate the start date (last Sunday) in YYYY-MM-DD format
  const getLastSunday = (dateStr: string): string => {
    const [year, month, day] = parseDateStr(dateStr);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek + (weeks - 1) * 7;
    date.setDate(date.getDate() - daysToSubtract);
    return formatDate(date, "yyyy-MM-dd");
  };

  const startDate = getLastSunday(today);

  // Create a map of date to count for quick lookup
  const dateToCount = new Map<string, number>(
    data.map((item) => [item.date, item.count])
  );

  // Find the maximum count for scaling the colors
  const maxCount = 50;

  // Helper function to add days to a date string
  const addDays = (dateStr: string, days: number): string => {
    const [year, month, day] = parseDateStr(dateStr);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return formatDate(date, "yyyy-MM-dd");
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    const [year, month, day] = parseDateStr(dateStr);
    const date = new Date(year, month - 1, day);
    return formatDate(date, "d MMM");
  };

  // Generate the grid of squares
  const squares = [];
  for (let week = 0; week < weeks; week++) {
    const weekSquares = [];
    const weekStartDate = addDays(startDate, week * 7);

    for (let day = 0; day < daysPerWeek; day++) {
      const dateStr = addDays(weekStartDate, day);
      const count = dateToCount.get(dateStr) || 0;

      // Calculate color intensity based on count
      const intensity = count === 0 ? 0 : Math.min(1, count / maxCount);
      const color =
        intensity === 0
          ? themeColors.surfaceSecondary
          : `rgba(16, 185, 129, ${intensity})`;

      // Check if this is today's square
      const isToday = dateStr === today;

      weekSquares.push(
        <View
          key={`${week}-${day}`}
          className="rounded-sm"
          style={{
            width: size,
            height: size,
            margin: spacing,
            backgroundColor: color,
            borderWidth: isToday ? 1 : 0,
            borderColor: themeColors.text,
          }}
        />
      );
    }

    squares.push(
      <View key={week} className="flex-row items-center">
        {axisLabels && (
          <TText
            className="text-xs text-right w-12 mr-1"
            style={{ color: themeColors.textTertiary }}
          >
            {formatDateForDisplay(weekStartDate)}
          </TText>
        )}
        {weekSquares}
      </View>
    );
  }

  return (
    <View className="items-center p-1">
      <View className="flex-col">
        <View
          className={classNames("flex-row items-center ml-1", {
            "pl-12": axisLabels,
          })}
        >
          {axisLabels &&
            ["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={`day-${i}`}
                style={{
                  width: size,
                  height: size,
                  margin: spacing,
                }}
              >
                <TText
                  className="text-center"
                  style={{
                    color: themeColors.textTertiary,
                    fontSize: xLabelSize,
                  }}
                >
                  {day}
                </TText>
              </View>
            ))}
        </View>
        {squares}

        {legend && (
          <View className="flex-row items-center mt-4 justify-between">
            <TText
              className="text-xs"
              style={{ color: themeColors.textTertiary }}
            >
              0 verses
            </TText>
            <View className="flex-row items-center">
              {[0.1, 0.25, 0.5, 0.75, 1].map((intensity) => (
                <View
                  key={`legend-${intensity}`}
                  style={[
                    {
                      width: size / 2,
                      height: size / 2,
                      margin: spacing,
                      backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                    },
                  ]}
                />
              ))}
            </View>
            <TText
              className="text-xs"
              style={{ color: themeColors.textTertiary }}
            >
              {maxCount} verses
            </TText>
          </View>
        )}
      </View>
    </View>
  );
};

export default SessionHistoryGraph;
