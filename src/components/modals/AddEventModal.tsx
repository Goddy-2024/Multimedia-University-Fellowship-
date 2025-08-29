import React, { useState } from 'react';
import { X } from 'lucide-react';

// Define the expected shape of event data
interface EventData {
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  attendeesCount: number;
  visitorsCount: number;
  speakers: string;
  description: string;
  status: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventData) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<
    Omit<EventData, 'attendeesCount' | 'visitorsCount'> & { attendeesCount: string; visitorsCount: string }
  >({
    name: '',
    date: '',
    time: '',
    location: '',
    type: '',
    attendeesCount: '',
    visitorsCount: '',
    description: '',
    speakers: '',
    status: 'Completed',
  });

  const eventTypes = [
    'Outreach',
    'Service',
    "Worship",
    'Fellowship',
    'Bible Study',
    'Repentance',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: EventData = {
      ...formData,
      attendeesCount: parseInt(formData.attendeesCount) || 0,
      visitorsCount: parseInt(formData.visitorsCount) || 0,
      status: 'Completed',
    };
    onSubmit(finalData);

    // Reset the form
    setFormData({
      name: '',
      date: '',
      time: '',
      location: '',
      type: '',
      attendeesCount: '',
      visitorsCount: '',
      description: '',
      speakers: '',
      status: 'Completed',
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
            <p className="text-sm text-gray-600 mt-1">Schedule a new fellowship event.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter event name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Event location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select event type</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="attendeesCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Attendees
            </label>
            <input
              type="number"
              id="attendeesCount"
              name="attendeesCount"
              value={formData.attendeesCount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="visitorsCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Visitors
              </label>
              <input
                type="number"
                id="visitorsCount"
                name="visitorsCount"
                value={formData.visitorsCount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="speakers" className="block text-sm font-medium text-gray-700 mb-2">
                Speakers
              </label>
              <input
                type="text"
                id="speakers"
                name="speakers"
                value={formData.speakers}
                onChange={handleChange}
                placeholder="Comma separated names"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-25px"

            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
