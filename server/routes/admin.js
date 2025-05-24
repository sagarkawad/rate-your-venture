import express from "express";
import bcrypt from "bcryptjs";
import { User, Store, Rating } from "../models/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../db.js";

const router = express.Router();


router.use(authenticate, authorize(["admin"]));


router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/stores", async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
        {
          model: Rating,
          attributes: ["rating"],
        },
      ],
    });


    const storesWithRating = stores.map((store) => {
      const storeData = store.toJSON();

  
      let rating = 0;
      if (storeData.Ratings && storeData.Ratings.length > 0) {
        const sum = storeData.Ratings.reduce((acc, r) => acc + r.rating, 0);
        rating = sum / storeData.Ratings.length;
      }

      return {
        id: storeData.id,
        name: storeData.name,
        email: storeData.email,
        address: storeData.address,
        rating: parseFloat(rating.toFixed(1)),
        owner: storeData.owner,
      };
    });

    res.json({ stores: storesWithRating });
  } catch (error) {
    console.error("Error getting stores:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/stores", async (req, res) => {
  try {
    const { name, email, address, password } = req.body;


    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const result = await sequelize.transaction(async (t) => {

      const owner = await User.create(
        {
          name,
          email,
          password, 
          address,
          role: "owner",
        },
        { transaction: t },
      );


      const store = await Store.create(
        {
          name,
          email,
          address,
          ownerId: owner.id,
        },
        { transaction: t },
      );

      return { owner, store };
    });

    res.status(201).json({
      message: "Store added successfully",
      storeId: result.store.id,
    });
  } catch (error) {
    console.error("Error adding store:", error);

   
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "address", "role", "createdAt"],
      include: [
        {
          model: Store,
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

   
    const usersWithRating = await Promise.all(
      users.map(async (user) => {
        const userData = user.toJSON();

        if (userData.role === "owner" && userData.Store) {
          // Get average rating for this store
          const ratings = await Rating.findAll({
            where: { storeId: userData.Store.id },
            attributes: ["rating"],
          });

          let rating = 0;
          if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            rating = sum / ratings.length;
          }

          userData.rating = parseFloat(rating.toFixed(1));
        }

        return userData;
      }),
    );

    res.json({ users: usersWithRating });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/users", async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Validate role
    if (role !== "admin" && role !== "user") {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be admin or user." });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }


    const user = await User.create({
      name,
      email,
      password, 
      address,
      role,
    });

    res.status(201).json({
      message: "User added successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error adding user:", error);


    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

export default router;
