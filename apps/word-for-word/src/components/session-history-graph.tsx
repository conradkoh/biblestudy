import React from 'react';
import { View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TText } from '@/src/components/core/TText';
import { formatDate } from 'date-fns';

interface ContributionData {
  date: string;
  count: number;
}

interface SessionHistoryGraphProps {
  data: ContributionData[];
  size?: number;
  spacing?: number;
}

const SessionHistoryGraph: React.FC<SessionHistoryGraphProps> = ({
  data,
  size = 10,
  spacing = 1,
}) => {
  const themeColors = useThemeColors();

  // Calculate the number of weeks to display
  const weeks = 4;
  const daysPerWeek = 7;

  // Get today's date in YYYY-MM-DD format
  const today = formatDate(new Date(), 'yyyy-MM-dd');

  // Helper function to parse date string
  const parseDateStr = (dateStr: string): [number, number, number] => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      throw new Error('Invalid date string format');
    }
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      throw new Error('Invalid date string format');
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
    return formatDate(date, 'yyyy-MM-dd');
  };

  const startDate = getLastSunday(today);

  // Create a map of date to count for quick lookup
  const dateToCount = new Map<string, number>(data.map(item => [item.date, item.count]));

  // Find the maximum count for scaling the colors
  const maxCount = 25;

  // Helper function to add days to a date string
  const addDays = (dateStr: string, days: number): string => {
    const [year, month, day] = parseDateStr(dateStr);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return formatDate(date, 'yyyy-MM-dd');
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    const [year, month, day] = parseDateStr(dateStr);
    const date = new Date(year, month - 1, day);
    return formatDate(date, 'd MMM');
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
      const color = intensity === 0 ? themeColors.surfaceSecondary : `rgba(16, 185, 129, ${intensity})`;

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
        <TText className="text-xs text-right w-12 mr-1" style={{ color: themeColors.textTertiary }}>
          {formatDateForDisplay(weekStartDate)}
        </TText>
        {weekSquares}
      </View>
    );
  }

  return (
    <View className="items-center p-1">
      <View className="flex-col">
        <View className="flex-row items-center ml-1 pl-12">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={`day-${i}`}
              style={{
                width: size,
                height: size,
                margin: spacing,
              }}
            >
              <TText className="text-[6px] text-center" style={{ color: themeColors.textTertiary }}>
                {day}
              </TText>
            </View>
          ))}
        </View>
        {squares}
      </View>
    </View>
  );
};

export default SessionHistoryGraph; 
