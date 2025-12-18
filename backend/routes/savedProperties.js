import express from 'express';
import SavedProperty from '../models/SavedProperty.js';

const router = express.Router();

// Get all saved properties for a user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (req.app.locals.mongoose?.connection?.readyState !== 1) {
      return res.json({ success: true, data: [], message: 'MongoDB not connected - saving features disabled' });
    }
    
    const userId = req.query.userId || 'default-user';
    const savedProperties = await SavedProperty.find({ userId }).sort({ savedAt: -1 });
    res.json({ success: true, data: savedProperties });
  } catch (error) {
    // If MongoDB error, return empty array instead of error
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB')) {
      return res.json({ success: true, data: [], message: 'MongoDB not available' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save a property
router.post('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (req.app.locals.mongoose?.connection?.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        error: 'MongoDB not connected - saving features are disabled. Please configure MONGODB_URI environment variable.' 
      });
    }
    
    const { userId = 'default-user', propertyId, property } = req.body;
    
    if (!propertyId || !property) {
      return res.status(400).json({ success: false, error: 'propertyId and property are required' });
    }

    const savedProperty = new SavedProperty({
      userId,
      propertyId,
      property
    });

    await savedProperty.save();
    res.status(201).json({ success: true, data: savedProperty });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Property already saved' });
    }
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB')) {
      return res.status(503).json({ 
        success: false, 
        error: 'MongoDB not available - saving features are disabled' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a saved property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || 'default-user';
    
    // Validate ID format (MongoDB ObjectId)
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid property ID format',
        reason: 'ID must be a valid MongoDB ObjectId'
      });
    }
    
    // Check if document exists first
    const existing = await SavedProperty.findOne({ _id: id, userId });
    
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Saved property not found',
        reason: 'The property you are trying to delete does not exist or has already been deleted'
      });
    }
    
    // Delete the document
    const deleted = await SavedProperty.findOneAndDelete({ _id: id, userId });
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Failed to delete property',
        reason: 'Property not found or already deleted'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Property removed from saved list',
      data: { id: deleted._id }
    });
  } catch (error) {
    // Handle MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ID format',
        reason: 'The provided ID is not valid'
      });
    }
    
    console.error('Delete saved property error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Check if a property is saved
router.get('/check/:propertyId', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (req.app.locals.mongoose?.connection?.readyState !== 1) {
      return res.json({ success: true, isSaved: false, message: 'MongoDB not connected' });
    }
    
    const { propertyId } = req.params;
    const userId = req.query.userId || 'default-user';
    
    const saved = await SavedProperty.findOne({ userId, propertyId });
    res.json({ success: true, isSaved: !!saved, data: saved });
  } catch (error) {
    // If MongoDB error, return not saved
    if (error.name === 'MongoServerError' || error.message.includes('MongoDB')) {
      return res.json({ success: true, isSaved: false, message: 'MongoDB not available' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

