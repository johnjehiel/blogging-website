import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, tagIndex }) => {

    let { blog, blog:{ tags }, setBlog } = useContext(EditorContext);

    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }

    const handleTagEdit = (e) => {
        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();
            let currentTag = e.target.innerText;
            tags[tagIndex] = currentTag;
            setBlog({ ...blog, tags });
            e.target.setAttribute("contentEditable", false);
        }
    }

    const handleTagDelete = () => {
        tags = tags.filter(t => t!=tag);
        setBlog({ ...blog, tags });
    }

    return (
        <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-8">
            <p className="outline-none" onKeyDown={handleTagEdit} onClick={addEditable} >{ tag }</p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2" onClick={handleTagDelete}>
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    )
}

export default Tag;

/*
inline-block -> to have more than one tag displayed side by side
outline-none -> we dont want the default outline when the click the tag to edit it
pointer-events-none -> we wont interact with the icon but we will interact with the button
-translate-y-1/2 -> vertically center an icon (or anything ) in a container
*/