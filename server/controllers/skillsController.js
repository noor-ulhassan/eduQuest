import { User } from "../models/user.model.js";

export const addSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedSkills = [...new Set([...(user.skills || []), ...skills])];

    user.skills = updatedSkills;
    await user.save();

    res.json({ skills: user.skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
