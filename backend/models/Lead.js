import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  service: {
    type: String,
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  budget: {
    type: String,
    trim: true,
    maxlength: [100, 'Budget range cannot exceed 100 characters']
  },
  timeline: {
    type: String,
    trim: true,
    maxlength: [100, 'Timeline cannot exceed 100 characters']
  },
  details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Inquiry details cannot exceed 2000 characters']
  },
  contactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'SMS', 'Other'],
    default: 'Email'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps automatically to track createdAt and updatedAt fields
  timestamps: true
});

// Create compound index or index on email/submittedAt for performance querying
LeadSchema.index({ email: 1 });
LeadSchema.index({ submittedAt: -1 });

const Lead = mongoose.model('Lead', LeadSchema);

export default Lead;
