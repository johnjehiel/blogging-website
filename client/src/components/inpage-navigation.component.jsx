import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) => { // give children prop to render the children elements inside the parent

    activeTabLineRef = useRef();
    activeTabRef = useRef();
    const [ inPageNavIndex, setInPageNavIndex ] = useState(defaultActiveIndex);

    let [ width, setWidth ] = useState(window.innerWidth);

    let [ isResizeEventAdded, setIsResizeEventAdded ] = useState(false);

    const changePageState = (btn, index) => {
        let { offsetWidth, offsetLeft } = btn; // take the values from the button
        activeTabLineRef.current.style.width = offsetWidth + "px"; // dont forget to add px
        activeTabLineRef.current.style.left = offsetLeft + "px"; // dont forget to add px

        setInPageNavIndex(index);
    }

    // to render the inpage navigation home button's border to black by default initially
    useEffect(() => {

        if (width > 766 && inPageNavIndex != defaultActiveIndex) {
            changePageState(activeTabRef.current, defaultActiveIndex);
        }

        if (!isResizeEventAdded) { // similar to recursion, where we add event listener to window
            window.addEventListener('resize', () => {
                if (!isResizeEventAdded) {
                    setIsResizeEventAdded(true);
                }

                setWidth(window.innerWidth);
            })
        }
    }, [width]);

  return (
    <>
        <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">

            {
                routes.map((route, index) => {
                    return (
                        <button ref={index == defaultActiveIndex ? activeTabRef : null}
                                className={"p-4 px-5 capitalize " + (inPageNavIndex == index ? "text-black" : "text-dark-grey")
                                            + ( defaultHidden.includes(route) ? " md:hidden" : "" ) } 
                                onClick={(e) => { changePageState(e.target, index) }}
                                key={index}>
                            { route }
                        </button>
                    );
                })
            }

            <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-dark-grey"/>
            
        </div>

        { Array.isArray(children) ? children[inPageNavIndex] : children /*IMPORTANT NOTE: if children is an array then render the one with the current active page index else render the children itself which is not an array*/ }
    </>
  )
}

export default InPageNavigation;

/*
- important to note the rendering of children from parent component
*/