import Lead from '../models/Lead.js';

/**
 * @desc    Submit a new contact/inquiry form
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res, next) => {
  try {
    const { fullName, businessName, email, service, budget, timeline, details, contactMethod } = req.body;

    // 1. Server-side validation of mandatory fields
    if (!fullName || !email || !businessName) {
      res.status(400);
      throw new Error('Please fill out all required fields: Full Name, Business Name, and Email.');
    }

    // 2. Format and validate email address format via simple regex
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address.');
    }

    // 3. Create and save the new Lead in MongoDB Atlas via Mongoose
    const newLead = await Lead.create({
      fullName,
      businessName,
      email,
      service,
      budget,
      timeline,
      details,
      contactMethod
    });

    // 4. Return success response with saved Lead ID
    res.status(201).json({
      success: true,
      message: 'Inquiry successfully saved to secure database.',
      leadId: newLead._id
    });
  } catch (error) {
    // Forward the error to the centralized error-handling middleware
    next(error);
  }
};

/**
 * @desc    Retrieve all inquiries (Optional - e.g., for secure admin dashboard)
 * @route   GET /api/contact
 * @access  Private (Mock/Placeholder access control for demo)
 */
export const getAllInquiries = async (req, res, next) => {
  try {
    // Fetch inquiries sorted by submission date (newest first)
    const leads = await Lead.find({}).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    next(error);
  }
};
