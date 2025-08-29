import React, { useState, useEffect } from 'react';
import { Mail, Upload, Users, Send, X, FileText, CheckCircle } from 'lucide-react';
import { emailAPI } from '../services/api';
import Footer from './Footer';

interface Member {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

interface SelectedMember extends Member {
  isSelected: boolean;
}

interface EmailStats {
  totalMembers: number;
  activeMembers: number;
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
}

const Email: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Manual recipient addition
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', department: '' });

  useEffect(() => {
    fetchEmailStats();
    fetchMembers();
  }, []);

  const fetchEmailStats = async () => {
    try {
      const stats = await emailAPI.getEmailStats();
      setEmailStats(stats);
    } catch (err) {
      console.error('Error fetching email stats:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedDepartment) query.append('department', selectedDepartment);
      if (selectedStatus) query.append('status', selectedStatus);
      
      const response = await emailAPI.getMemberEmails(query.toString());
      // Add isSelected property to each member
      const membersWithSelection = response.emails.map((member: Member) => ({
        ...member,
        isSelected: true // Default to selected
      }));
      setMembers(membersWithSelection);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to fetch member emails');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    const selectedMembers = members.filter(member => member.isSelected);
    if (selectedMembers.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    try {
      setSending(true);
      setError('');

      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('recipientType', 'custom');
      formData.append('selectedEmails', JSON.stringify(selectedMembers.map(m => m.email)));

      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await emailAPI.sendBulkEmail(formData);
      
      // Show detailed success message with results
      const successMessage = `Email sending completed! ${response.data.successfulEmails} emails sent successfully, ${response.data.failedEmails} failed.`;
      setSuccess(true);
      setSubject('');
      setMessage('');
      setAttachments([]);
      
      // Log detailed results for debugging
      console.log('Email sending results:', response.data);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, isSelected } : member
    ));
  };

  const handleSelectAll = (isSelected: boolean) => {
    setMembers(prev => prev.map(member => ({ ...member, isSelected })));
  };

  const handleAddRecipient = () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      setError('Name and email are required');
      return;
    }

    const newMember: SelectedMember = {
      id: `manual-${Date.now()}`,
      name: newRecipient.name,
      email: newRecipient.email,
      department: newRecipient.department || 'Manual',
      status: 'Active',
      isSelected: true
    };

    setMembers(prev => [...prev, newMember]);
    setNewRecipient({ name: '', email: '', department: '' });
    setShowAddRecipient(false);
    setError('');
  };

  const handleRemoveRecipient = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const selectedCount = members.filter(member => member.isSelected).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Email</h1>
          <p className="text-gray-600 mt-1">Send emails to fellowship members</p>
        </div>
        
        {/* Email Stats */}
        {emailStats && (
          <div className="flex space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Total Members</div>
              <div className="text-xl font-bold text-blue-900">{emailStats.totalMembers}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">Active Members</div>
              <div className="text-xl font-bold text-green-900">{emailStats.activeMembers}</div>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold">Email sending completed!</span>
          </div>
          <div className="text-sm text-green-700">
            Check the console for detailed delivery results.
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <X className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Compose Email</span>
            </h2>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message here..."
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload files (max 5 files, 10MB each)
                    </span>
                  </label>
                </div>
                
                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipients Panel */}
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Recipients</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Active Members</option>
                  <option value="department">Specific Department</option>
                  <option value="status">By Status</option>
                </select>
              </div>

              {recipientType === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    <option value="Worship">Worship</option>
                    <option value="Youth">Youth</option>
                    <option value="Media">Media</option>
                    <option value="Ushering">Ushering</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Outreach">Outreach</option>
                    <option value="IT & Video">IT & Video</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              )}

              {recipientType === 'status' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              <button
                onClick={fetchMembers}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh Recipients'}
              </button>
            </div>
          </div>

          {/* Recipients List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Recipients ({selectedCount}/{members.length})
              </h3>
              <button
                onClick={() => setShowAddRecipient(true)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                + Add
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Select All */}
                {members.length > 0 && (
                  <div className="flex items-center p-2 bg-gray-100 rounded mb-2">
                    <input
                      type="checkbox"
                      checked={selectedCount === members.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                )}
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={member.isSelected}
                          onChange={(e) => handleMemberSelection(member.id, e.target.checked)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {member.department}
                        </span>
                        {member.id.startsWith('manual-') && (
                          <button
                            onClick={() => handleRemoveRecipient(member.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendEmail}
            disabled={sending || !subject.trim() || !message.trim() || selectedCount === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Email ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Recipient Modal */}
      {showAddRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Recipient</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={newRecipient.department}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Worship">Worship</option>
                  <option value="Youth">Youth</option>
                  <option value="Media">Media</option>
                  <option value="Ushering">Ushering</option>
                  <option value="Prayer">Prayer</option>
                  <option value="Outreach">Outreach</option>
                  <option value="IT & Video">IT & Video</option>
                  <option value="Administration">Administration</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddRecipient}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Recipient
              </button>
              <button
                onClick={() => {
                  setShowAddRecipient(false);
                  setNewRecipient({ name: '', email: '', department: '' });
                  setError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Email;
