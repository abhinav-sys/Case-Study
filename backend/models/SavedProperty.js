import mongoose from 'mongoose';

const savedPropertySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default-user' // In production, use actual user authentication
  },
  propertyId: {
    type: Number,
    required: true
  },
  property: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate saves
savedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });

const SavedProperty = mongoose.model('SavedProperty', savedPropertySchema);

export default SavedProperty;

