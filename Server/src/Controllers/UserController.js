// UserController.js
import generateToken from "../Config/jwthelper.js";
import UserModel from "../Models/UserModel.js";

// PlayerForm Data (name, dob, Tnbaid, academyName, place, district) update
export const PlayerFormChange = async (req, res) => {
  try {
    const { name, dob, TnBaId, academyName, place, district } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        name,
        dob,
        TnBaId,
        academyName,
        place,
        district,
      },
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Generate token for local storage update
    // 🔹 Define base payload for token
    const tokenPayload = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      role: updatedUser.role,
    };

    // 🔹 Generate JWT token
    const token = generateToken(tokenPayload);
    res.status(200).json({
      success: true,
      message: "Player form updated successfully",
      data: {
        user: {
          name: updatedUser.name,
          dob: updatedUser.dob,
          TnBaId: updatedUser.TnBaId || null,
          academyName: updatedUser.academyName || null,
          place: updatedUser.place || null,
          district: updatedUser.district || null,
        },
      },
      token,
    });
  } catch (error) {
    console.error("Error updating player form:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating player form",
      error: error.message,
    });
  }
};


