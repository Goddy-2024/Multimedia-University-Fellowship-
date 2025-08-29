import express from 'express';
import Member from '../models/Member.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get department distribution
router.get('/department-distribution', authenticate, async (req, res) => {
  try {
    const departmentData = await Member.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $group: {
          _id: '$department',
          members: { $sum: 1 }
        }
      },
      {
        $sort: { members: -1 }
      }
    ]);

    const formattedData = departmentData.map(item => ({
      department: item._id,
      members: item.members
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Department distribution error:', error);
    res.status(500).json({
      message: 'Error fetching department distribution',
      error: error.message
    });
  }
});

// Get monthly summary
router.get('/monthly-summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = endDate ? new Date(endDate) : new Date();
    const startOfRange = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEvents, totalAttendance, totalVisitors] = await Promise.all([
      Event.countDocuments({
        date: { $gte: startOfRange, $lte: now }
      }),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfRange, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$attendeesCount' }
          }
        }
      ]),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfRange, $lte: now }
          }
        },
        { $group: { _id: null, visitors: { $sum: '$visitorsCount' } } }
      ])
    ]);

    const attendance = totalAttendance.length > 0 ? totalAttendance[0].total : 0;
    const visitors = totalVisitors.length > 0 ? totalVisitors[0].visitors : 0;
    const averagePerEvent = totalEvents > 0 ? Math.round(attendance / totalEvents) : 0;

    res.json({
      totalEvents,
      totalAttendance: attendance,
      totalVisitors: visitors,
      averagePerEvent
    });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({
      message: 'Error fetching monthly summary',
      error: error.message
    });
  }
});

// Get top events
router.get('/top-events', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: 'Completed' };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const topEvents = await Event.aggregate([
      {
        $match: match
      },
      {
        $group: {
          _id: '$name',
          avgAttendance: { $avg: '$attendeesCount' },
          eventCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgAttendance: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const formattedData = topEvents.map(event => ({
      name: event._id,
      avgAttendance: `${Math.round(event.avgAttendance)} avg`
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Top events error:', error);
    res.status(500).json({
      message: 'Error fetching top events',
      error: error.message
    });
  }
});

// Get growth metrics
router.get('/growth-metrics', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = endDate ? new Date(endDate) : new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // If a custom range is provided, compute metrics for that range vs the preceding equal-length range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const rangeMs = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - rangeMs);

      const [
        thisPeriodMembers,
        lastPeriodMembers,
        thisPeriodAttendance,
        lastPeriodAttendance,
        thisPeriodEvents
      ] = await Promise.all([
        Member.countDocuments({ status: 'Active', joinDate: { $lte: end } }),
        Member.countDocuments({ status: 'Active', joinDate: { $lte: prevEnd } }),
        Event.aggregate([
          { $match: { status: 'Completed', date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$attendeesCount' } } }
        ]),
        Event.aggregate([
          { $match: { status: 'Completed', date: { $gte: prevStart, $lte: prevEnd } } },
          { $group: { _id: null, total: { $sum: '$attendeesCount' } } }
        ]),
        Event.countDocuments({ date: { $gte: start, $lte: end } })
      ]);

      const thisAtt = thisPeriodAttendance.length > 0 ? thisPeriodAttendance[0].total : 0;
      const lastAtt = lastPeriodAttendance.length > 0 ? lastPeriodAttendance[0].total : 0;
      const attendanceGrowth = lastAtt > 0 ? (((thisAtt - lastAtt) / lastAtt) * 100).toFixed(1) : '0.0';

      // Events per week within range
      const weeks = Math.max(1, rangeMs / (1000 * 60 * 60 * 24 * 7));
      const eventFrequency = (thisPeriodEvents / weeks).toFixed(1);

      const memberGrowth = lastPeriodMembers > 0
        ? (((thisPeriodMembers - lastPeriodMembers) / lastPeriodMembers) * 100).toFixed(1)
        : '0.0';

      return res.json({
        memberGrowth: `${Number(memberGrowth) > 0 ? '+' : ''}${memberGrowth}%`,
        attendanceGrowth: `${Number(attendanceGrowth) > 0 ? '+' : ''}${attendanceGrowth}%`,
        eventFrequency: `${eventFrequency}/week`
      });
    }

    const [
      thisMonthMembers,
      lastMonthMembers,
      thisMonthAttendance,
      lastMonthAttendance,
      thisMonthEvents,
      lastMonthEvents
    ] = await Promise.all([
      Member.countDocuments({
        status: 'Active',
        createdAt: { $lte: now }
      }),
      Member.countDocuments({
        status: 'Active',
        createdAt: { $lte: endOfLastMonth }
      }),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfThisMonth, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$attendeesCount' }
          }
        }
      ]),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$attendeesCount' }
          }
        }
      ]),
      Event.countDocuments({
        date: { $gte: startOfThisMonth, $lte: now }
      }),
      Event.countDocuments({
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      })
    ]);

    // Calculate growth percentagesqz 
    const memberGrowth = lastMonthMembers > 0 
      ? ((thisMonthMembers - lastMonthMembers) / lastMonthMembers * 100).toFixed(1)
      : '0.0';

    const thisMonthAtt = thisMonthAttendance.length > 0 ? thisMonthAttendance[0].total : 0;
    const lastMonthAtt = lastMonthAttendance.length > 0 ? lastMonthAttendance[0].total : 0;
    
    const attendanceGrowth = lastMonthAtt > 0 
      ? ((thisMonthAtt - lastMonthAtt) / lastMonthAtt * 100).toFixed(1)
      : '0.0';

    // Calculate event frequency (events per week)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weeksInMonth = daysInMonth / 7;
    const eventFrequency = (thisMonthEvents / weeksInMonth).toFixed(1);

    res.json({
      memberGrowth: `${memberGrowth > 0 ? '+' : ''}${memberGrowth}%`,
      attendanceGrowth: `${attendanceGrowth > 0 ? '+' : ''}${attendanceGrowth}%`,
      eventFrequency: `${eventFrequency}/week`
    });
  } catch (error) {
    console.error('Growth metrics error:', error);
    res.status(500).json({
      message: 'Error fetching growth metrics',
      error: error.message
    });
  }
});

// Get monthly attendance trend
router.get('/attendance-trend', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 6 months if no date range provided
    const now = endDate ? new Date(endDate) : new Date();
    const sixMonthsAgo = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    }

    const attendanceData = await Event.aggregate([
      {
        $match: {
          status: { $in: ['Completed', 'Planning', 'Upcoming', 'Ongoing'] },
          date: { $gte: sixMonthsAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          avgAttendance: { $avg: '$attendeesCount' },
          totalEvents: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedData = attendanceData.map(item => ({
      month: monthNames[item._id.month - 1],
      attendance: Math.round(item.avgAttendance),
      events: item.totalEvents
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Attendance trend error:', error);
    res.status(500).json({
      message: 'Error fetching attendance trend',
      error: error.message
    });
  }
});

export default router;
