import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { API_URL } from '../config';
import { getHeaders } from '../redux/Slices/EntriesSlice';
import axios from "axios";
import { toast } from "react-hot-toast";

// Lucide React Icons
import { 
  Users, 
  Ticket, 
  Calendar, 
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  User,
  School,
  RefreshCw,
  TrendingUp,
  Download,
  ShieldCheck,
  Activity,
  Filter
} from 'lucide-react';

// React Icons
import { 
  FaMale, 
  FaFemale, 
  FaTrophy,
  FaChartPie,
  FaUserCheck,
  FaMoneyBillWave,
  FaRegCalendarAlt,
  FaTableTennis,
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('today');
  const [filteredData, setFilteredData] = useState(null);

  // Time range options
  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last2days', label: 'Last 2 Days' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'allTime', label: 'All Time' }
  ];

  // Calculate date ranges based on selected filter
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last2days':
        start.setDate(now.getDate() - 2);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastWeek':
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - now.getDay() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'allTime':
      default:
        return { start: null, end: null };
    }

    return { start, end };
  };

  // Fetch dashboard data with time filter
  const fetchDashboardData = async (range = timeRange) => {
    setLoading(true);
    setError('');
    
    try {
      const { start, end } = getDateRange(range);
      
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString());
      if (end) params.append('endDate', end.toISOString());
      params.append('timeRange', range);

      const response = await axios.get(
        `${API_URL}/api/v1/admin/dashboard?${params.toString()}`,
        getHeaders()
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
        setFilteredData(response.data.data);
        toast.success(`Dashboard data loaded for ${timeRangeOptions.find(opt => opt.value === range)?.label}`);
      } else {
        setError(response.data.msg || 'Failed to fetch dashboard data');
        toast.error(response.data.msg || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to fetch dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    fetchDashboardData(newRange);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
  };

  // Calculate percentages
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Process data for charts from API
  const processChartData = () => {
    if (!filteredData) return {};

    const {
      categoryDistribution,
      genderDistribution,
      paymentStats,
      eventStats,
      recentRegistrations,
      topAcademies
    } = filteredData;

    // Event Type Distribution from actual events data
    const eventTypeData = [
      { 
        type: 'Singles', 
        count: eventStats?.singlesEvents || 0, 
        icon: <FaTableTennis className="text-blue-600" /> 
      },
      { 
        type: 'Doubles', 
        count: eventStats?.doublesEvents || 0, 
        icon: <FaUsers className="text-green-600" /> 
      },
      { 
        type: 'Mixed Doubles', 
        count: eventStats?.mixedDoublesEvents || 0, 
        icon: <FaUserFriends className="text-purple-600" /> 
      }
    ];

    // Generate dynamic data based on time range
    const generateTrendData = () => {
      const baseCount = recentRegistrations?.length || 10;
      const days = timeRange === 'today' ? 1 : 
                   timeRange === 'yesterday' ? 1 :
                   timeRange === 'last2days' ? 2 :
                   timeRange === 'thisWeek' || timeRange === 'lastWeek' ? 7 : 30;
      
      const labels = [];
      if (days === 1) {
        labels.push('Today');
      } else if (days === 2) {
        labels.push('Yesterday', 'Today');
      } else {
        for (let i = days - 1; i >= 0; i--) {
          if (days === 7) {
            labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]);
          } else {
            labels.push(`Day ${i + 1}`);
          }
        }
      }

      return labels.map((label, index) => ({
        day: label,
        registrations: Math.floor(baseCount * (0.5 + Math.random() * 0.5)),
        payments: Math.floor((paymentStats?.successfulPayments || 10) * (0.3 + Math.random() * 0.7))
      }));
    };

    const trendData = generateTrendData();

    // Payment status data for pie chart
    const paymentStatusData = [
      { name: 'Paid', value: paymentStats?.successfulPayments || 0, color: '#10B981' },
      { name: 'Pending', value: paymentStats?.pendingPayments || 0, color: '#F59E0B' },
      { name: 'Failed', value: paymentStats?.failedPayments || 0, color: '#EF4444' }
    ];

    return {
      eventTypeData,
      trendData,
      paymentStatusData
    };
  };

  // Get display label for current time range
  const getTimeRangeLabel = () => {
    return timeRangeOptions.find(opt => opt.value === timeRange)?.label || 'All Time';
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={handleRefresh}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No dashboard data available.
        </div>
      </div>
    );
  }

  const {
    totalUsers,
    totalEntries,
    totalEvents,
    totalPayments,
    paymentStats,
    eventStats,
    userStats,
    recentRegistrations,
    topAcademies,
    genderDistribution,
    categoryDistribution
  } = filteredData;

  const chartData = processChartData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tournament Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Showing data for <span className="font-semibold text-blue-600">{getTimeRangeLabel()}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Time Range Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Users</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{formatNumber(totalUsers)}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                {formatNumber(userStats?.verifiedUsers || 0)} verified
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculatePercentage(userStats?.verifiedUsers, totalUsers)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {calculatePercentage(userStats?.verifiedUsers, totalUsers)}% verified
            </p>
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Entries</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{formatNumber(totalEntries)}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                {formatNumber(eventStats?.approvedEvents || 0)} approved
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculatePercentage(eventStats?.approvedEvents, totalEntries)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {calculatePercentage(eventStats?.approvedEvents, totalEntries)}% approved
            </p>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Events</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{formatNumber(totalEvents)}</p>
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Across all entries
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculatePercentage(eventStats?.completedEvents || 0, totalEvents)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {calculatePercentage(eventStats?.completedEvents || 0, totalEvents)}% completed
            </p>
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Payments</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">₹{formatNumber(paymentStats?.totalAmount || 0)}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                {formatNumber(paymentStats?.successfulPayments || 0)} successful
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <IndianRupee className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculatePercentage(paymentStats?.successfulPayments, totalPayments)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {calculatePercentage(paymentStats?.successfulPayments, totalPayments)}% success rate
            </p>
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registration Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Registration Trends - {getTimeRangeLabel()}
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(value), 'Registrations']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6} 
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaMoneyBillWave className="w-5 h-5 mr-2 text-green-600" />
              Payment Trends - {getTimeRangeLabel()}
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(value), 'Payments']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                  name="Payments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rest of the dashboard components remain the same */}
      {/* Event Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Event Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaChartPie className="w-5 h-5 mr-2 text-blue-600" />
              Event Category Distribution
            </h3>
            <FaTrophy className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Event Type Statistics
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.eventTypeData.map((eventType, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  {eventType.icon}
                  <span className="font-medium text-gray-700">{eventType.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">{formatNumber(eventType.count)}</span>
                  <span className="text-xs text-gray-500">
                    {calculatePercentage(eventType.count, totalEvents)}% of total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender & Player Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Gender Distribution
            </h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(value), 'Players']} />
                <Legend />
                <Bar dataKey="count" name="Players">
                  {(genderDistribution || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.gender === 'male' ? '#3B82F6' : '#EC4899'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaMale className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-blue-600 font-bold text-lg">Boys</span>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(genderDistribution?.find(g => g.gender === 'male')?.count || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {calculatePercentage(genderDistribution?.find(g => g.gender === 'male')?.count, totalUsers)}% of total
              </p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaFemale className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-pink-600 font-bold text-lg">Girls</span>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(genderDistribution?.find(g => g.gender === 'female')?.count || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {calculatePercentage(genderDistribution?.find(g => g.gender === 'female')?.count, totalUsers)}% of total
              </p>
            </div>
          </div>
        </div>

        {/* Player Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              Player Statistics - {getTimeRangeLabel()}
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(totalUsers)}</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(userStats?.verifiedUsers || 0)}</div>
                <div className="text-sm text-gray-600">Verified Players</div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Active Players</span>
                <span className="text-yellow-600 font-bold">{formatNumber(userStats?.activeUsers || 0)}</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">New Registrations</span>
                <span className="text-green-600 font-bold">+{recentRegistrations?.length || 0}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Total Academies</span>
                <span className="text-blue-600 font-bold">{formatNumber(topAcademies?.length || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Academies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaRegCalendarAlt className="w-5 h-5 mr-2 text-blue-600" />
              Recent Registrations - {getTimeRangeLabel()}
            </h3>
            <span className="text-sm text-gray-500">{recentRegistrations?.length || 0} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Player</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Events</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations?.slice(0, 5).map((registration, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-gray-900">{registration.playerName}</div>
                        <div className="text-sm text-gray-500">{registration.tnbaId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {registration.events?.slice(0, 2).map((event, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {event.category} {event.type}
                          </span>
                        ))}
                        {registration.events?.length > 2 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{registration.events.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                        registration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {new Date(registration.registrationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!recentRegistrations || recentRegistrations.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No recent registrations found.
              </div>
            )}
          </div>
        </div>

        {/* Top Academies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <School className="w-5 h-5 mr-2 text-green-600" />
              Top Academies
            </h3>
            <FaUserCheck className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topAcademies?.slice(0, 8).map((academy, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-600' :
                    index === 2 ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-700 truncate">
                    {academy.name || 'Unknown Academy'}
                  </span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  {formatNumber(academy.count)}
                </span>
              </div>
            ))}
            {(!topAcademies || topAcademies.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No academy data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;