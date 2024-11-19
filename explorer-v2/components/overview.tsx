import { useTheme } from 'next-themes';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchForm } from './search-form';
import { useContext } from 'react';
import { UseChatContext } from '@/context/use-chat-context';
import { Step } from '@/lib/types';

const COLORS = {
  light: {
    primary: '#6366F1', // Indigo
    secondary: '#F97316', // Orange
    accent: '#8B5CF6', // Purple
    chart: ['#6366F1', '#F97316', '#8B5CF6', '#14B8A6', '#F59E0B'],
    text: 'text-gray-700',
    cardBg: 'bg-white/50',
  },
  dark: {
    primary: '#818CF8', // Lighter Indigo
    secondary: '#FB923C', // Lighter Orange
    accent: '#A78BFA', // Lighter Purple
    chart: ['#818CF8', '#FB923C', '#A78BFA', '#2DD4BF', '#FBBF24'],
    text: 'text-gray-200',
    cardBg: 'bg-gray-800/50',
  },
};

export const Overview = () => {
  const modalityData = [
    { name: 'MRI', value: 108000000 },
    { name: 'CT', value: 84000000 },
    { name: 'X-Ray', value: 72000000 },
    { name: 'Ultrasound', value: 36000000 },
  ];

  const sexData = [
    { name: 'Male', value: 144000000 },
    { name: 'Female', value: 141000000 },
    { name: 'Other', value: 15000000 },
  ];

  const ageData = [
    { name: '0-18', value: 66000000 },
    { name: '19-30', value: 72000000 },
    { name: '31-50', value: 84000000 },
    { name: '51-70', value: 54000000 },
    { name: '71+', value: 24000000 },
  ];

  const totalCount = 300_000_000;

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;

  // Format large numbers for chart tooltips
  const formatValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const { input, maxDistance, resultLimit } = useContext(UseChatContext);

  return (
    <div className="transition-colors duration-200 m-4">
      <div className="space-y-6">
        {/* Hero Section Card */}
        <Card
          className={`border-0 shadow-lg ${colors.cardBg} backdrop-blur-sm transition-colors duration-200`}
        >
          <CardContent className="p-8">
            <h1 className="text-6xl font-bold">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 text-transparent bg-clip-text">
                Scout
              </span>
            </h1>
            <p
              className={`mt-4 text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              } transition-colors duration-200`}
            >
              Explore and analyze the CT-RATE clinical population. CT-RATE contains chest CT volumes
              paired with corresponding radiology text reports, multi-abnormality labels, and
              metadata.
            </p>

            {/* Stats */}
            <div className="mt-6">
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Currently exploring{' '}
                <span className="font-bold bg-gradient-to-r from-indigo-500 to-orange-500 text-transparent bg-clip-text">
                  {totalCount.toLocaleString()}
                </span>{' '}
                patient records.
              </p>
            </div>

            {/* Search */}
            <SearchForm
              inputType="text"
              step={Step.BuildQuery}
              defaultValue={input}
              placeholder="Search..."
              maxDistance={maxDistance}
              resultLimit={resultLimit}
              offerClose={false}
            />
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Modality Distribution */}
          <Card
            className={`shadow-md hover:shadow-lg transition-all duration-200 ${colors.cardBg}`}
          >
            <CardHeader>
              <CardTitle className={colors.text}>Modality Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modalityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors.chart[index % colors.chart.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatValue(value)}
                    contentStyle={{
                      backgroundColor: isDark
                        ? 'rgba(31, 41, 55, 0.9)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      color: isDark ? '#e5e7eb' : '#374151',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sex Distribution */}
          <Card
            className={`shadow-md hover:shadow-lg transition-all duration-200 ${colors.cardBg}`}
          >
            <CardHeader>
              <CardTitle className={colors.text}>Sex Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sexData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors.chart[index % colors.chart.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatValue(value)}
                    contentStyle={{
                      backgroundColor: isDark
                        ? 'rgba(31, 41, 55, 0.9)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      color: isDark ? '#e5e7eb' : '#374151',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card
            className={`shadow-md hover:shadow-lg transition-all duration-200 ${colors.cardBg}`}
          >
            <CardHeader>
              <CardTitle className={colors.text}>Age Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <XAxis dataKey="name" tick={{ fill: isDark ? '#e5e7eb' : '#374151' }} />
                  <YAxis
                    tickFormatter={formatValue}
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatValue(value)}
                    contentStyle={{
                      backgroundColor: isDark
                        ? 'rgba(31, 41, 55, 0.9)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      color: isDark ? '#e5e7eb' : '#374151',
                    }}
                  />
                  <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
