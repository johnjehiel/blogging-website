import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateUsername } from "../utils/generateUsername.js";
import { formatDataToSend } from "../utils/formatDataToSend.js";
import { getAuth } from "firebase-admin/auth";
import { passwordRegex, emailRegex } from "../utils/regex.js";

export const signup = async (req, res) => {
    let {fullname, email, password} = req.body;
    // validating data from front end
    if (fullname.length < 3) {
        return res.status(403).json({"error": "Fullname must be atleast 3 letters long"})
    }
    if (!email.length) {
        return res.status(403).json({"error": "Enter Email"});
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({"error": "Invalid Email"});
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({"error": "Password should be 6 to 20 characters with a numeric, 1 lowercase and 1 uppercase letters"});
    }
    // salting for 10 rounds
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })

        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        })
        .catch(err => {
            if (err.code == 11000) { // duplication error
                return res.status(500).json({"error": "Email already exists"})
            }
            return res.status(500).json({"error": err.message})
        });
    })
}

export const signin = async (req, res) => {
    let { email, password } = req.body;
    User.findOne({ "personal_info.email": email })
    .then((user) => {
        if (!user) {
            return res.status(403).json({ "error": "Email not found" })
        }
        
        if (!user.google_auth) {
            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({ "error": "Error Occured while login, please try again" });
                }
                if (!result) { // incorrect password
                    return res.status(403).json({ "error": "Incorrect Password" });
                } else {
                    return res.status(200).json(formatDataToSend(user))
                }
            })
        } else {
            return res.status(403).json({ "error": "Account was already created with google" })
        }
        
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ "error": err.message })
    })
}

export const googleAuth = async (req, res) => {
    
    let { access_token } = req.body;
    if (!access_token) {
        return res.status(500).json({ "error": "Failed to authenticate with google. access_token is null" });
    }
    
    getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
        let { email, name, picture } = decodedUser;

        picture = picture.replace("s96-c", "s384-c"); // convert google image to high resolution

        let user = await User.findOne({ "personal_info.email": email })
                                .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                                .then((u) => {
                                    return u || null;
                                })
                                .catch((err) => {
                                    res.status(500).json({ "error":err.message });
                                })
        if (user) { // login
            if (!user.google_auth) {
                return res.status(403).json({ "error":"This email was signed up without google. Please log in with password to access the account" })
            }
        } else { // signin
            let username = await generateUsername(email);
            user = new User({
                personal_info: { fullname: name, email, profile_img: picture, username },
                google_auth: true
            })
            await user.save().then((u) => {
                user = u; // setting user again to the new user object 'u'
            })
            .catch(err => {
                return res.status(500).json({ "error":err.message });
            })
        }
        
        return res.status(200).json(formatDataToSend(user));
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ "error": "Failed to authenticate with google. Try with some other google account" });
    })
}

export const changePassword = async (req, res) => {

    let { currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword) ) {
        return res.status(403).json({ error: "Password should be 6 to 20 characters with a numeric, 1 lowercase and 1 uppercase letters"})
    }

    User.findOne({ _id: req.user })
    .then((user) => {
        if (user.google_auth) {
            return res.status(403).json({error: "you logged in through google"})
        }

        bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
            if (err) {
                res.status(500).json({error: "Error occured while changing password, try later"})
            }

            if (!result) {
                return res.status(403).json({error: "current password is incorrect"})
            }

            bcrypt.hash(newPassword, 10, (err, hashed_password) => {

                User.findOneAndUpdate({ _id: req.user }, { "personal_info.password": hashed_password })
                .then((u) => {
                    return res.status(200).json({status: "password changed successfully"})
                })
                .catch(err => {
                    return res.status(500).json({error: "Error occured while saving new password, try later"})
                })
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({error: "user not found"});
    })

}

export const updateProfileImage = async (req, res) => {

    let authorId = req.user;
    let { profileImage } = req.body;

    if (!profileImage) {
        return res.status(403).json({ error: "Must provide Profile Image"});
    }

    User.findOneAndUpdate({ _id: authorId }, { "personal_info.profile_img": profileImage })
    .then(() => {
        return res.status(200).json({ profile_img: profileImage });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

}

export const updateProfile = async (req,res) => {

    let { username, bio, social_links } = req.body;
    let bioLimit = 150;

    if (username.length < 3) {
        return res.status(403).json({error : "username must have atleast 3 characters"});
    }
    if (bio.length > bioLimit) {
        return res.status(403).json({error : "bio limit Exceeded"});
    }

    let socialLinksArr = Object.keys(social_links);

    try {
        for (let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) { // it is not necessary to have all links filled
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != "website") {
                    return res.status(403).json({error : `${socialLinksArr[i]} link is invalid`});
                }
            }
        }
    } catch (err) {
        return res.status(403).json({error : "you must provide full social links with http(s) included"});
    }

    let UpdateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({ _id: req.user }, UpdateObj, {
        runValidators: true // run validate before updating it to validate users
    })
    .then(() => {
        return res.status(200).json({ username })
    })
    .catch(err => {
        if (err.code == 11000) { // error for duplication
            return res.status(409).json({ error: "username is already taken" })
        }
        return res.status(403).json({ error: err.message });
    })


}