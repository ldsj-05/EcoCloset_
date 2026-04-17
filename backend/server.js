const express = require('express');
const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const Outfit = require('./models/Outfit'); // Add this import
const app = express();
const cors = require('cors');

app.use(cors());

// Middleware
app.use(express.json());


// === POST: Create profile ===
app.post("/api/profile", async (req, res) => {
  const { name, email, location, preferences } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const profile = new Profile({ name, email, location, preferences });
    await profile.save();

    console.log("Received profile:", req.body);
    console.log("Profile saved in MongoDB:", profile);

    res.status(201).json({ message: "Profile saved", profile });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// === PUT: Update profile ===
app.put("/api/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, location, preferences } = req.body;

  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      { name, email, location, preferences },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("Profile updated:", updatedProfile);
    res.json({ message: "Profile updated", profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// === GET: Get profile by ID ===
app.get("/api/profile/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// === OUTFIT ROUTES (moved here, after app is defined) ===

// === OUTFIT ROUTES ===

// POST: Create outfit
app.post("/api/outfits", async (req, res) => {
  const { name, items, userId } = req.body;

  console.log("Received outfit data:", req.body); // Add this for debugging

  if (!name || !items || items.length === 0 || !userId) {
    return res.status(400).json({ message: "Name, items, and userId required" });
  }

  try {
    const outfit = new Outfit({
      name,
      items,
      userId,
      createdAt: new Date(),
    });
    await outfit.save();

    console.log("Outfit saved to MongoDB:", outfit); // Debug log
    res.status(201).json({ message: "Outfit saved", outfit });
  } catch (error) {
    console.error("Error saving outfit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET: Get all outfits for user
app.get("/api/outfits/:userId", async (req, res) => {
  console.log("Fetching outfits for user:", req.params.userId); // Debug log
  
  try {
    const outfits = await Outfit.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    console.log("Found outfits:", outfits.length); // Debug log
    res.json(outfits);
  } catch (error) {
    console.error("Error fetching outfits:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// === Test route ===
app.get('/', (req, res) => {
  res.send("API is running");
});

// DELETE: Delete outfit
app.delete("/api/outfits/:id", async (req, res) => {
  try {
    const deleted = await Outfit.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Outfit not found" });
    }
    
    console.log("Outfit deleted:", req.params.id);
    res.json({ message: "Outfit deleted" });
  } catch (error) {
    console.error("Error deleting outfit:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// === Connect to MongoDB ===
mongoose.connect("mongodb+srv://seaobrien147_db_user:LnyJPCpJj8oJIEPe@cluster0.xtlznnu.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// Start server
app.listen(5000, () => console.log("Server running on port 5000"));