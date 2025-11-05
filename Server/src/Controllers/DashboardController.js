// Controllers/DashboardController.js
import UserModel from '../Models/UserModel.js';
import EntryModel from '../Models/EntryModel.js';
import PaymentModel from '../Models/PaymentModel.js';
import mongoose from 'mongoose';

/**
 * Get dashboard statistics and analytics with time filtering
 * @param {*} req
 * @param {*} res
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, timeRange } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total counts with date filtering
    const totalUsers = await UserModel.countDocuments(dateFilter);
    const totalEntries = await EntryModel.countDocuments(dateFilter);
    const totalPayments = await PaymentModel.countDocuments(dateFilter);

    // Total events count (sum of all events across all entries)
    const totalEventsPipeline = [
      { $match: dateFilter },
      { $project: { eventsCount: { $size: "$events" } } },
      { $group: { _id: null, total: { $sum: "$eventsCount" } } }
    ];
    const totalEventsResult = await EntryModel.aggregate(totalEventsPipeline);
    const totalEvents = totalEventsResult[0]?.total || 0;

    // Payment statistics with date filtering
    const paymentStatsPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$metadata.paymentAmount" },
          successfulPayments: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } }
        }
      }
    ];
    const paymentStats = await PaymentModel.aggregate(paymentStatsPipeline);

    // Event status statistics with date filtering
    const eventStatsPipeline = [
      { $match: dateFilter },
      { $unwind: "$events" },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          approvedEvents: { $sum: { $cond: [{ $eq: ["$events.status", "approved"] }, 1, 0] } },
          pendingEvents: { $sum: { $cond: [{ $eq: ["$events.status", "pending"] }, 1, 0] } },
          rejectedEvents: { $sum: { $cond: [{ $eq: ["$events.status", "rejected"] }, 1, 0] } },
          singlesEvents: { $sum: { $cond: [{ $eq: ["$events.type", "singles"] }, 1, 0] } },
          doublesEvents: { $sum: { $cond: [{ $eq: ["$events.type", "doubles"] }, 1, 0] } },
          mixedDoublesEvents: { $sum: { $cond: [{ $eq: ["$events.type", "mixed doubles"] }, 1, 0] } }
        }
      }
    ];
    const eventStats = await EntryModel.aggregate(eventStatsPipeline);

    // User statistics with date filtering
    const userStatsPipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          verifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } }
        }
      }
    ];
    const userStats = await UserModel.aggregate(userStatsPipeline);

    // Recent registrations with populated data and date filtering
    const recentRegistrations = await EntryModel.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('player', 'name TnBaId')
      .lean();

    // Format recent registrations
    const formattedRegistrations = recentRegistrations.map(entry => ({
      playerName: entry.player?.name || 'N/A',
      tnbaId: entry.player?.TnBaId || 'N/A',
      events: entry.events.map(event => ({
        category: event.category,
        type: event.type
      })),
      status: entry.events.some(e => e.status === 'pending') ? 'pending' : 
              entry.events.every(e => e.status === 'approved') ? 'approved' : 'mixed',
      registrationDate: entry.createdAt
    }));

    // Top academies by player count with date filtering
    const topAcademiesPipeline = [
      { $match: { ...dateFilter, academyName: { $exists: true, $ne: "" } } },
      { $group: { _id: "$academyName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ];
    const topAcademies = await UserModel.aggregate(topAcademiesPipeline);

    // Gender distribution with date filtering
    const genderDistributionPipeline = [
      { $match: { ...dateFilter, gender: { $in: ["male", "female"] } } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
      {
        $project: {
          gender: "$_id",
          count: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$count", totalUsers] },
                  100
                ]
              },
              1
            ]
          },
          _id: 0
        }
      }
    ];
    const genderDistribution = await UserModel.aggregate(genderDistributionPipeline);

    // Event category distribution with date filtering
    const categoryDistributionPipeline = [
      { $match: dateFilter },
      { $unwind: "$events" },
      { $group: { _id: "$events.category", count: { $sum: 1 } } },
      {
        $project: {
          name: "$_id",
          count: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$count", totalEvents] },
                  100
                ]
              },
              1
            ]
          },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ];
    const categoryDistribution = await EntryModel.aggregate(categoryDistributionPipeline);

    // Prepare response data
    const dashboardData = {
      totalUsers,
      totalEntries,
      totalEvents,
      totalPayments,
      paymentStats: paymentStats[0] || {
        totalAmount: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0
      },
      eventStats: eventStats[0] || {
        totalEvents: 0,
        approvedEvents: 0,
        pendingEvents: 0,
        rejectedEvents: 0,
        singlesEvents: 0,
        doublesEvents: 0,
        mixedDoublesEvents: 0
      },
      userStats: userStats[0] || {
        verifiedUsers: 0,
        activeUsers: 0
      },
      recentRegistrations: formattedRegistrations,
      topAcademies,
      genderDistribution,
      categoryDistribution,
      timeRange: timeRange || 'allTime',
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch dashboard data'
    });
  }
};