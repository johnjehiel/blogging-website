const storeInLocalStorage = (key, value) => {
return localStorage.setItem(key, value);
}

const lookInLocalStorage = (key) => {
    return localStorage.getItem(key);
}

const removeFromLocalStorage = (key) => {
    return localStorage.removeItem(key);
}

const logOutUser = () => {
    localStorage.clear();
}

export { storeInLocalStorage, lookInLocalStorage, removeFromLocalStorage, logOutUser };