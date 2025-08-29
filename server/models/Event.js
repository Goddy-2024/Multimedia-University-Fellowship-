import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['Outreach', 'Service', 'Fellowship', 'Bible Study', 'Repentance']
  },
  attendeesCount: {
    type: Number,
    required: [true, 'Number of attendees is required'],
    min: [0, 'Number of attendees cannot be negative'],
    default: 0
  },
  visitorsCount: {
    type: Number,
    min: [0, 'Number of visitors cannot be negative'],
    default: 0
  },
  speakers: {
    type: String,
    maxlength: [200, 'Speakers cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['Completed'],
    default: 'Completed'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date
  }],
  // The following legacy fields have been removed to simplify event data entry post-event:
  // - expectedAttendees
  // - actualAttendees
  // - budget
  // - notes
}, {
  timestamps: true
});

// Index for search and date queries
eventSchema.index({ name: 'text', location: 'text', type: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

export default mongoose.model('Event', eventSchema);