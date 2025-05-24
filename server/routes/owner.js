import express from 'express';
import { User, Store, Rating } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op, Sequelize } from 'sequelize';

const router = express.Router();


router.use(authenticate, authorize(['owner']));


router.get('/stats', async (req, res) => {
  try {
    const ownerId = req.user.id;
    

    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          attributes: ['rating'],
        },
      ],
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const storeData = store.toJSON();
    
  
    let averageRating = 0;
    const totalRatings = storeData.Ratings ? storeData.Ratings.length : 0;
    
    if (totalRatings > 0) {
      const sum = storeData.Ratings.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / totalRatings;
    }
    
    res.json({
      storeDetails: {
        name: storeData.name,
        email: storeData.email,
        address: storeData.address,
      },
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings,
    });
  } catch (error) {
    console.error('Error getting store stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/rating-users', async (req, res) => {
  try {
    const ownerId = req.user.id;
    
 
    const store = await Store.findOne({
      where: { ownerId },
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
  
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    
 
    const users = ratings.map(rating => {
      const ratingData = rating.toJSON();
      return {
        id: ratingData.User.id,
        name: ratingData.User.name,
        email: ratingData.User.email,
        rating: ratingData.rating,
        ratedAt: ratingData.createdAt,
      };
    });
    
    res.json({ users });
  } catch (error) {
    console.error('Error getting rating users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;