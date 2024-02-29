import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";

const ChangePassword = () => {

    let { userAuth: { access_token } } = useContext(UserContext);

    let changePasswordForm = useRef();

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current); // need to pass the form reference to the FormData class
        let formData = { };
        
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        // the following destructured variables HAVE TO be the same as the name of the INPUTBOX
        let { currentPassword, newPassword } = formData;

        if (!currentPassword.length) {
            return toast.error("Enter current password")
        }
        if (!newPassword.length) {
            return toast.error("Enter new password")
        }
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword) ) {
            return toast.error("Password should be 6 to 20 characters with a numeric, 1 lowercase and 1 uppercase letters")
        }

        e.target.setAttribute("disabled", true); // to ensure that even if the user clicks many time the button will be disabled till the current http request gets finished

        let loadingToast = toast.loading("Updating...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.success("password updated");
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response.data.error);
        })

    }

    return (
        <AnimationWrapper>
            <Toaster />
            <form ref={changePasswordForm}>
                <h1 className="max-md:hidden">Change Password</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Current Password" icon="fi-rr-unlock"/>
                    <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New Password" icon="fi-rr-unlock"/>
                
                    <button onClick={handleSubmit} className="btn-dark px-10" type="submit" >Change Password</button>
                </div>
            </form>
        </AnimationWrapper>
    )
}

export default ChangePassword;