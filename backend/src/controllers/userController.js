//file for all functions of the user routes
import User from "../models/User.js";


export const updateProfile = async(req, res) => {
    try {
        //get the input by the user
        const { newUsername, newPassword, confirmNewPassword, confirmOldPassword } = req.body;

        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({message: "user not found"});
        
        //if password has been entered
        if (newPassword){
            const isOldPasswordCorrect = await user.matchPassword(confirmOldPassword);

            if (!isOldPasswordCorrect) {
                return res.status(401).json({
                    message: "Old password is incorrect",
                });
            };
            //check if the new passsword is the same as the confirmed 
            if(newPassword != confirmNewPassword) {
                return res.status(400).json({
                    messsage: "New password does not match",
                });
            };
            //update password
            user.password = newPassword;
        };

        //update username
        if (newUsername) user.username = newUsername;

        //save the users details, and send it
        await user.save();
        const userResponse = user.toObject();

        res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse,
        });
        
    //show any other error
    } catch (error) {
        console.error("Update Failed:", error);
        res.status(500).json({message: "Update failed"});
    }
}

export const deleteProfile = async(req, res) => {
    try {
        //find user by the id, and delete the account
        const deleteUser = req.user._id
        await User.findByIdAndDelete(deleteUser);
        res.status(200).json({
            message: "Account deleted successfully",
            userId: deleteUser,
        });
    } catch (error) {
        console.error("Deletion Failed:", error);
        res.status(500).json({message: "server Error"})
    }
}