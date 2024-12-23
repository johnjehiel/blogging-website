import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInLocalStorage } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notifications from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const darkThemePreference = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    const [ theme, setTheme ] = useState(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {
        let userInSession = lookInLocalStorage("user");
        let themeInSession = lookInLocalStorage("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })
    
        if (themeInSession) { // updating the theme in session so that even if th euser refreshes their page the theme will be set to the theme that is stored in the session
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);

                return themeInSession;
            })
        } else {
            document.body.setAttribute('data-theme', theme);
        }

    }, []);

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            <UserContext.Provider value={{ userAuth, setUserAuth }}>
                <Routes>
                    <Route path="/editor" element={<Editor />}></Route>
                    <Route path="/editor/:blog_id" element={<Editor />}></Route>
                    <Route path="/" element={<Navbar />}>
                        <Route index element={<HomePage />}/>
                        <Route path="dashboard" element={<SideNav />}>
                            <Route path="blogs" element={<ManageBlogs />} />
                            <Route path="notifications" element={<Notifications />} />
                        </Route>
                        <Route path="settings" element={<SideNav />}>
                            <Route path="edit-profile" element={<EditProfile />} />
                            <Route path="change-password" element={<ChangePassword />} />
                        </Route>
                        <Route path="signin" element={<UserAuthForm type="sign-in"/>}/>
                        <Route path="signup" element={<UserAuthForm type="sign-up"/>}/>
                        <Route path="search/:query" element={<SearchPage />}/>
                        <Route path="user/:id" element={<ProfilePage />}/>
                        <Route path="blog/:blog_id" element={<BlogPage />} />
                        <Route path="*" element={<PageNotFound />} /> {/* '*'j includes all paths and so we have to put it at the very end */}
                    </Route>
                </Routes>
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
}

export default App;