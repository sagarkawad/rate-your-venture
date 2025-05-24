import express from 'express';
import { User, Store, Rating } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op, Sequelize } from 'sequelize';

const router = express.Router();


router.use(authenticate, authorize(['user']));


router.get('/stores', async (req, res) => {
  try {
    const userId = req.user.id;
    

    const stores = await Store.findAll({
      attributes: ['id', 'name', 'address'],
      include: [
        {
          model: Rating,
          attributes: ['rating', 'userId'],
        },
      ],
    });
    
 
    const storesWithRatings = stores.map(store => {
      const storeData = store.toJSON();
      
  
      let overallRating = 0;
      if (storeData.Ratings && storeData.Ratings.length > 0) {
        const sum = storeData.Ratings.reduce((acc, r) => acc + r.rating, 0);
        overallRating = sum / storeData.Ratings.length;
      }
      
      
      const userRating = storeData.Ratings.find(r => r.userId === userId);
      
      return {
        id: storeData.id,
        name: storeData.name,
        address: storeData.address,
        overallRating: parseFloat(overallRating.toFixed(1)),
        userRating: userRating ? userRating.rating : null,
      };
    });
    
    res.json({ stores: storesWithRatings });
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/ratings', async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;
    

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
   
    const store = await Store.findByPk(storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    

    const existingRating = await Rating.findOne({
      where: {
        userId,
        storeId,
      },
    });
    
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      
      res.json({
        message: 'Rating updated successfully',
        ratingId: existingRating.id,
      });
    } else {
      const newRating = await Rating.create({
        userId,
        storeId,
        rating,
      });
      
      res.status(201).json({
        message: 'Rating submitted successfully',
        ratingId: newRating.id,
      });
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;