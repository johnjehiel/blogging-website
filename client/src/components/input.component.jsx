import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, disable = false}) => {
    
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    return (
        <div className="relative w-[100%] mb-4">
            <input
                name = {name}
                type = {type == "password" ? (passwordVisibility ? "text" : "password") : type}
                placeholder = {placeholder}
                defaultValue = {value}
                id = {id}
                disabled={disable}
                className="input-box placeholder:text-dark-grey"
            />
            <i className={"fi " + icon + " input-icon"}></i>
            {
                type == "password" ?
                <i className={`fi fi-rr-eye${passwordVisibility ? "" : "-crossed"} input-icon left-[auto] right-4 cursor-pointer`}
                   onClick={() => setPasswordVisibility(curVal => !curVal)}></i>
                : ""
            }
        </div>
    )
}
export default InputBox;