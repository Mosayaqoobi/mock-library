//file for all functions of the user routes
import User from "../models/User.js";


export const updateProfile = async(req, res) => {
    try {
        //get the input by the user
        const {username, password } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if(password) updateData.password = password;

        const user = await User.findById(req.user._id);

        if(!user) return res.status(404).json({message: "user not found"});

        if (username) user.username = username;
        if(password) user.password = password;

        //save the users details, and send it
        await user.save();
        const userResponse = user.toObject();
        res.status(200).json({message: "Profile updated successfully", user: userResponse});
        
    //show any other error
    } catch (error) {
        console.error("Update Failed:", error);
        res.status(500).json({message: "Update failed"});
    }
}

export const deleteProfile = async(req, res) => {
    try {
        //find user by the id, and delete the account
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({message: "Account deleted successfully"});
    } catch (error) {
        console.error("Deletion Failed:", error);
        res.status(500).json({message: "server Error"})
    }
}