import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";

const EditProfile = () => {

    let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);

    let bioLimit = 150;

    let profileImgEle = useRef();
    let editProfileForm = useRef();

    const [ profile, setProfile ] = useState(profileDataStructure);
    const [ loading, setLoading ] = useState(true);
    
    let { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links } = profile;
    
    const [ currentCharacters, setCurrentCharacters ] = useState(bio ? bio.length : 0);
    const [ updatedProfileImage, setUpdatedProfileImage ] = useState(null);

    useEffect(() => {
        
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: userAuth.username })
            .then(({ data }) => {
                // console.log(data);
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                toast.error("cannot get profile details")
            })
        }
    }, [access_token])

    const handleCharacterChange = (e) => {
        setCurrentCharacters(e.target.value.length)
    }

    const convertToBase64 = (e) => {
        let img = e.target.files[0];
        if (img) {
            let loadingToast = toast.loading("Uploading...");
            var reader = new FileReader();
            
            // Resize or compress image before converting to base64
            // Example: Resize image to maximum width or height of 800 pixels
            const maxSize = 800;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const imgElement = new Image();
            
            imgElement.onload = () => {
                let width = imgElement.width;
                let height = imgElement.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                context.drawImage(imgElement, 0, 0, width, height);

                // Convert the resized image to base64

                setUpdatedProfileImage(canvas.toDataURL('image/jpeg'));
                // console.log(updatedProfileImage);
                toast.dismiss(loadingToast);
                toast.success("Uploaded !");
            };
            
            profileImgEle.current.src = URL.createObjectURL(img);
            imgElement.src = URL.createObjectURL(img);
        }
    }

    const handleImageUpload = (e) => {

        e.preventDefault();

        if (updatedProfileImage) {
            
            let loadingToast = toast.loading("Uploading...");
            e.target.setAttribute("disabled", true);

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-image", { profileImage: updatedProfileImage }, {
                headers: {
                    "Authorization": `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                let newUserAuth = { ...userAuth, profile_img: data.profile_img }

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);

                setUpdatedProfileImage(null);

                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.success("Uploaded !");
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.error(response.data.error);
            })

        }

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(editProfileForm.current);
        let formData =  { };

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

        if (username.length < 3) {
            return toast.error("username must have atleast 3 characters");
        }
        if (bio.length > bioLimit) {
            return toast.error(`Bio Limit Exceeded: ${bio.length}/${bioLimit}`)
        }

        let loadingToast = toast.loading("Updating...");
        e.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {
            username, bio, 
            social_links: { youtube, facebook, twitter, github, instagram, website }
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            if (userAuth.username != data.username) { // if the user has changed their username then we have to store the new username in the SESSION

                let newUserAuth = { ...userAuth, username: data.username };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);

            }

            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.success("Profile Updated");
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
        })
        
    }

    return (
        <>
            <Toaster />
            <AnimationWrapper>
                {
                    loading ? <Loader /> : 
                    <form ref={editProfileForm}>
                        <h1 className="max-md:hidden">Edit Profile</h1>

                        <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

                            <div className="max-lg:center mb-5">
                                <label htmlFor="uploadImg" id="profileImgLable" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                    <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                                        Upload Image
                                    </div>
                                    
                                    <img ref={profileImgEle} src={profile_img} alt="profile image" />
                                </label>

                                <input type="file" id="uploadImg" accept=".jpeg, .png, .jpg" hidden onChange={convertToBase64}  /> 

                                <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload}>
                                    Upload
                                </button>
                            </div>

                            <div className="w-full">

                                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                                    <div>
                                        <InputBox name="fullname" type="text" value={fullname} placeholder="Full Name" disable={true} icon="fi-rr-user" />
                                    </div>
                                    <div>
                                        <InputBox name="email" type="email" value={email} placeholder="Email" disable={true} icon="fi-rr-envelope" />
                                    </div>
                                </div>

                                <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="fi-rr-at" />

                                <p className="text-dark-grey -mt-3">Username will be used to search user and will be visible to all users</p>

                                <textarea name="bio" maxLength={bioLimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Bio" onChange={handleCharacterChange}></textarea>
                                <p className="mt-1 text-dark-grey">{ currentCharacters }/{ bioLimit } characters</p>

                                <p className="my-6 text-dark-grey">Add your social handles</p>

                                <div className="md:grid md:grid-cols-2 gap-x-6">

                                    {

                                        Object.keys(social_links).map((key, index) => {
                                            let link = social_links[key];
                                            // <i className={"fi " + (key!="website" ? "fi-brands-" + key : "fi-rr-globe") + " text-2xl hover:text-black"}></i>
                                            return <InputBox key={index} name={key} type="text" value={link} placeholder="http://" icon={"fi " + (key!="website" ? "fi-brands-" + key : "fi-rr-globe")}/>
                                        })

                                    }

                                </div>

                                <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit} >Update</button> 

                            </div> 

                        </div>
                    </form>
                }
            </AnimationWrapper>
        </>
    )
}

export default EditProfile;