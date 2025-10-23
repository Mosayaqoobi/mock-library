//this will be where the functions for the login, register, and me routes goes


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  };

//Register function
export const register = async(req, res) => {
    //get the required fields from the user (in req)
    const { username, email, password } = req.body; 
    
    //check if the user has entered all details
    try {
        if (!username || !email || !password) {
            return res.status(400).json({message: "please fill in all of the fields"})
        }
        // check if user exists already
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({message: "user already exists"})
        }
        //create the user
        const user = await User.create({username, email, password});
        const token = generateToken(user._id);
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        })
    //throw error, with message if user hasnt entered all the fields
    } catch (error) {
        res.status(500).json({
            message: "server error"
        });
    }
}

//login function
export const login = async (req, res) => {
    //get the required fields entered by the user
    const { email, password } = req.body;
    //check if the user has entered all fields
    try {
        if (!email || !password) {
            return res.status(400).json({message: "please fill in all of the fields"})
        }
        //get the user by email
        const user = await User.findOne({email});
        // if user doesnt exist, or the password doesnt match with the hashed password in db, return a invalid response
        if (!user || !(await user.matchPassword(password))) {

            return res.status(401).json({
                message: "invalid credentials",
            })
        }
        //generates a temporary token
        const token = generateToken(user._id);
        //return a success status code, and the credentials of the user
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        })
    //throw error if all fields werent filled
    } catch (error) {
        res.status(500).json({
            message: "server error",
        });
    }
}

//me function to get the current user information
export const me = async(req, res) => {
    res.status(200).json(req.user)
}