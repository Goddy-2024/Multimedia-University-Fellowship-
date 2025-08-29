import express from 'express';
import mongoose from 'mongoose';
import Member from '../models/Member.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // If MongoDB is not connected, return mock data
      const mockStats = {
        totalMembers: 150,
        thisMonthEvents: 8,
        newMembersThisMonth: 12,
        attendanceRate: '85%'
      };

      const mockRecentActivities = [
        { name: 'Morning Class Evangelism', attendees: 14, timeAgo: '2 days ago' },
        { name: 'Lunch Hour Fellowship', attendees: 18, timeAgo: '1 week ago' },
        { name: 'Sunday Service', attendees: 12, timeAgo: '1 week ago' },
        { name: 'Bible Study', attendees: 8, timeAgo: '2 weeks ago' },
        { name: 'Prayer Meeting', attendees: 6, timeAgo: '2 weeks ago' }
      ];

      const mockUpcomingEvents = [
        { name: 'Weekly Fellowship', date: '2024-12-18', status: 'Upcoming' },
        { name: 'Youth Conference', date: '2024-12-20', status: 'Planning' },
        { name: 'Christmas Service', date: '2024-12-25', status: 'Upcoming' },
        { name: 'New Year Prayer', date: '2025-01-01', status: 'Planning' }
      ];

      return res.json({
        stats: mockStats,
        recentActivities: mockRecentActivities,
        upcomingEvents: mockUpcomingEvents
      });
    }

    // Calculate real statistics from database
    const [
      totalMembers,
      thisMonthEvents,
      newMembersThisMonth,
      recentEvents,
      upcomingEvents,
      attendanceData
    ] = await Promise.all([
      // Total active members
      Member.countDocuments({ status: 'Active' }),
      
      // Events this month
      Event.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // New members this month
      Member.countDocuments({
        joinDate: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // Recent events for activity list
      Event.find({
        status: 'Completed',
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
      .sort({ date: -1 })
      .limit(5)
      .select('name attendeesCount date'),
      
      // Upcoming events
      Event.find({
        date: { $gte: now },
        status: { $in: ['Planning', 'Upcoming'] }
      })
      .sort({ date: 1 })
      .limit(5)
      .select('name date status'),
      
      // Attendance data for rate calculation
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalAttendees: { $sum: '$attendeesCount' },
            events: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculate attendance rate as average attendees per event vs total members
    let attendanceRate = 0;
    if (attendanceData.length > 0 && totalMembers > 0) {
      const avgPerEvent = attendanceData[0].events > 0
        ? attendanceData[0].totalAttendees / attendanceData[0].events
        : 0;
      attendanceRate = Math.round((avgPerEvent / totalMembers) * 100);
    }

    res.json({
      stats: {
        totalMembers,
        thisMonthEvents,
        newMembersThisMonth,
        attendanceRate: `${attendanceRate}%`
      },
      recentActivities: recentEvents.map(event => ({
        name: event.name,
        attendees: event.attendeesCount,
        timeAgo: getTimeAgo(event.date)
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        name: event.name,
        date: event.date.toISOString().split('T')[0],
        status: event.status
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});



// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default router;