import { Link } from "react-router-dom";
import lightPageNotFoundImage from "../imgs/404-light.png"
import darkPageNotFoundImage from "../imgs/404-dark.png"
import lightFullLogo from "../imgs/full-logo-light.png"
import darkFullLogo from "../imgs/full-logo-dark.png"
import { useContext } from "react";
import { ThemeContext } from "../App";

const PageNotFound = () => {

    let { theme } = useContext(ThemeContext);

    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-14 text-center">
            
            <img src={theme == "light" ? darkPageNotFoundImage : lightPageNotFoundImage} className="select-none border-2 border-grey w-72 aspect-square object-cover rounded" alt="page not found" />
            <h1 className="text-4xl font-gelasio leading-7">Page Not Found</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-8">The page you are looking for doesn't exist. Head back to <Link to="/" className="text-black underline">home page</Link></p>

            <div className="-mt-7">
                <img src={theme == "light" ? darkFullLogo : lightFullLogo} className="h-40 object-contain block mx-auto select-none" alt="logo" />
                <p className="text-dark-grey">Read Millions of Stories around the World</p>
            </div>

        </section>
    )
}

export default PageNotFound;