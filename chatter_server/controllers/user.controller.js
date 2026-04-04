import User from "../models/user.js";

// Get all users except the logged in user (for sidebar)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId } // exclude self
    }).select("-password");

    res.status(200).json(users);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};