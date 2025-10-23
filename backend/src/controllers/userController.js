//file for all functions of the user routes
import User from "../models/User.js";


export const updateProfile = async(req, res) => {
    try {
        //get the input by the user
        const {username, email } = req.body;
        //try to find that user and update
        const user = await User.findByIdAndUpdate(req.user._id, {username, email}, {new: true, runValidators: true}).select("-password");
        res.status(200).json({message: "Profile updated successfully", user :user});
    //show any other error
    } catch (error) {
        console.log("Update Failed:", error);
        res.status(500).json({message: "Update failed"});
    }
}

export const deleteProfile = async(req, res) => {
    try {
        //find user by the id, and delete the account
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({message: "Account deleted successfully"});
    } catch (error) {
        console.log("Deletion Failed:", error);
        res.status(500).json({message: "server Error"})
    }
}