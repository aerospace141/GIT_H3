const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

    username: {
    type: String,
    unique: true,
    // sparse: true // allows multiple documents with `null` or no username
  },

  // otp:[{
  //   code: { type: String, required: true },
  //   expiry: { type: Date, required: true }
  // }],
   // Embed otpSchema as an object within userSchema

   firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
   currentDeviceId: { type: String, default: null },
  lastLoginTime: { type: Date, default: null },
  deviceFingerprint: { type: String, default: null },

  // Subscription related
  hasActiveSubscription: { type: Boolean, default: false },
  trialExpiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from signup
  },
  subscriptionStart: { type: Date, default: null },
  subscriptionEnd: { type: Date, default: null },
  // address: {
  //   street: String,
  //   city: String,
  //   state: String,
  //   postalCode: String,
  //   country: String
  // },
  // cart: [{
  //   productId: {
      
  //     type: Number,
  //     ref: 'Product' 
  //   },
  //   quantity: Number
  // }],
  // totalAmount: Number,
  // role: {
  //   type: String,
  //   enum: ['admin', 'user','member'],
  //   default: 'user',
  // },
  // likedBooks: [{ type: String, ref: 'Book' }] ,
   role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  group: { type: String },
  rewards: {
    stars: { type: Number, default: 0 },
    badges: { type: Number, default: 0 }
  },
  rewardHistory: [{
    type: { type: String, enum: ['stars', 'badges'] },
    amount: Number,
    note: String,
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  // In User.js, add this field to userSchema:
  hiddenAnnouncements: [{
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    hiddenAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastActive: { type: Date, default: Date.now },


// === ADD THESE NEW FIELDS FOR ADMIN STUDENT MANAGEMENT ===
  class: { type: String }, // Additional field for class (in addition to group)
  section: { type: String }, // New field for section
  studentId: { type: String }, // Alias for userId for clarity
  name: { type: String }, // Virtual or computed field
  
  // Optional additional fields you might want later
  dateOfBirth: { type: Date },
  parentName: { type: String },
  parentEmail: { type: String },
  parentPhone: { type: String },
  isActive: { type: Boolean, default: true }

});

// === ADD THESE VIRTUAL FIELDS AND METHODS ===

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get class with section
userSchema.methods.getClassSection = function() {
  if (this.role === 'student') {
    const className = this.class || this.group;
    return this.section ? `${className}-${this.section}` : className;
  }
  return null;
};

// Method to check if user is teacher
userSchema.methods.isTeacher = function() {
  return this.role === 'teacher';
};

// Method to check if user is student
userSchema.methods.isStudent = function() {
  return this.role === 'student';
};

// Static method to find students by class
userSchema.statics.findStudentsByClass = function(className, section = null) {
  const query = { role: 'student', $or: [{ class: className }, { group: className }] };
  if (section) {
    query.section = section;
  }
  return this.find(query).select('-password');
};



const User = mongoose.model('User', userSchema);

module.exports = User;