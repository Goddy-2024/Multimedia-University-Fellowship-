import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Event from '../models/Event.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fellowship_management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Member.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@rhsf.com',
      password: 'rhsf2024',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample members
    const members = [
      {
        name: 'Godswill Omondi Ajuoga',
        email: 'gaoajuoga@gmail.com',
        phone: '+254740275539',
        department: 'IT & Video',
        joinDate: new Date('2024-08-28'),
        status: 'Active'
      },
      {
        name: 'William Ndiema',
        email: 'william.ndiema@gmail.com',
        phone: '+254700000000',
        department: 'Worship',
        joinDate: new Date('2023-08-28'),
        status: 'Active'
      },
      {
        name: 'Ephraim Muganda',
        email: 'ephraim.muganda@gmail.com',
        phone: '+254700000001',
        department: 'Worship',
        joinDate: new Date('2023-08-28'),
        status: 'Active'
      },
      {
        name: 'Emmanuel Kwemboi',
        email: 'emmanuel.kwemboi@gmail.com',
        phone: '+254711000000',
        department: 'Worship',
        joinDate: new Date('2023-08-28'),
        status: 'Active'
      },
      {
        name: 'Oulton Madegwa',
        email: 'oulton.madegwa@gmail.com',
        phone: '+254722000000',
        department: 'Media',
        joinDate: new Date('2023-12-10'),
        status: 'Active'
      },
      {
        name: 'Phabriziah Agitsa',
        email: 'phabriziah.agitsa@gmail.com',
        phone: '+254733000000',
        department: 'Worship',
        joinDate: new Date('2023-02-20'),
        status: 'Active'
      },
      {
        name: 'admin',
        email: 'admin.rhsf@gmail.com',
        phone: '+254700000000',
        department: 'Administration',
        joinDate: new Date('2025-08-09'),
        status: 'Active'
      },
      {
        name: 'Michael Omondi',
        email: 'michael.omondi@gmail.com',
        phone: '+254755000000',
        department: 'Worship',
        joinDate: new Date('2023-03-12'),
        status: 'Active'
      },
      {
        name: 'Kelvin Mukoko',
        email: 'kelvin.mukoko@gmail.com',
        phone: '+254700000000',
        department: 'IT & Video',
        joinDate: new Date('2024-08-28'),
        status: 'Active'
      },
      {
        name: 'Pello Kemboi',
        email: 'pello.kemboi@gmail.com',
        phone: '+254700000000',
        department: 'Worship',
        joinDate: new Date('2024-08-28'),
        status: 'Active'
      },
      {
        name: 'Vincent Omondi',
        email: 'vincent.omondi@gmail.com',
        phone: '+254740000000',
        department: 'Youth',
        joinDate: new Date('2024-08-28'),
        status: 'Active'
      },
      {
        name: 'Faith Byanzi',
        email: 'faith.buyanzi@gmail.com',
        phone: '+254709090900',
        department: 'Youth',
        joinDate: new Date('2024-08-28'),
        status: 'Active'
      },
      {
        name: 'James Mwaura',
        email: 'james.mwaura@gmail.com',
        phone: '+254740080808',
        department: 'Media',
        joinDate: new Date('2023-08-28'),
        status: 'Active'
      },
    ];

    const createdMembers = await Member.insertMany(members);
    console.log('Created sample members');

    // Create sample events
    const events = [
      {
        name: 'Morning Class Evangelism',
        description: 'Weekly morning evangelism outreach to share the gospel with students',
        date: new Date('2024-12-15'),
        time: '09:00',
        location: 'Main Hall',
        type: 'Service',
        attendeesCount: 142,
        visitorsCount: 10,
        speakers: 'Pastor John Doe',
        status: 'Completed',
        organizer: createdMembers[0]._id
      },
      {
        name: 'Weekly Fellowship',
        description: 'Regular weekly fellowship meeting for prayer and worship',
        date: new Date('2024-12-18'),
        time: '19:00',
        location: 'Conference Room',
        type: 'Fellowship',
        attendeesCount: 85,
        visitorsCount: 5,
        speakers: 'Elder Jane',
        status: 'Completed',
        organizer: createdMembers[1]._id
      },
      {
        name: 'Lunch Hour Fellowship',
        description: 'Midday fellowship session during lunch break',
        date: new Date('2024-12-10'),
        time: '14:00',
        location: 'Main Hall',
        type: 'Service',
        attendeesCount: 185,
        visitorsCount: 20,
        speakers: 'Guest Speaker A',
        status: 'Completed',
        organizer: createdMembers[2]._id
      },
      {
        name: 'Youth Outreach',
        description: 'Special outreach program targeting young people',
        date: new Date('2024-12-20'),
        time: '10:00',
        location: 'Youth Center',
        type: 'Outreach',
        attendeesCount: 120,
        visitorsCount: 15,
        speakers: 'Team Leads',
        status: 'Completed',
        organizer: createdMembers[3]._id
      },
      {
        name: 'Sunday Service',
        description: 'Main Sunday worship service for the fellowship',
        date: new Date('2024-12-08'),
        time: '10:00',
        location: 'Main Hall',
        type: 'Service',
        attendeesCount: 120,
        visitorsCount: 8,
        speakers: 'Pastor John',
        status: 'Completed',
        organizer: createdMembers[1]._id
      },
      {
        name: 'Bible Study',
        description: 'In-depth Bible study session for spiritual growth',
        date: new Date('2024-12-05'),
        time: '19:00',
        location: 'Conference Room',
        type: 'Bible Study',
        attendeesCount: 85,
        visitorsCount: 3,
        speakers: 'Elder Paul',
        status: 'Completed',
        organizer: createdMembers[4]._id
      },
      {
        name: 'Repentance Meeting',
        description: 'Special meeting focused on repentance and spiritual renewal',
        date: new Date('2024-12-03'),
        time: '18:00',
        location: 'Prayer Room',
        type: 'Repentance',
        attendeesCount: 67,
        visitorsCount: 2,
        speakers: 'Leadership Team',
        status: 'Completed',
        organizer: createdMembers[6]._id
      }
    ];

    await Event.insertMany(events);
    console.log('Created sample events');

    console.log('✅ Seed data created successfully!');
    console.log('Admin credentials: admin / rhsf2024');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();