import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../imgs/blog banner light.png"
import darkBanner from "../imgs/blog banner dark.png"
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component"; 
import { ThemeContext, UserContext } from "../App";
import axios from "axios";

const BlogEditor = () => {

    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);
    //console.log(EditorContext); // gave some unexpected error, title is undefined
    let { userAuth: { access_token } } = useContext(UserContext);

    let { theme } = useContext(ThemeContext);

    let { blog_id } = useParams();

    let navigate = useNavigate();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Let's write a blog"
            }))
        }
    }, []);
    /*
    const convertToBase64 = (e) => {
        console.log(e);
        let img = e.target.files[0]; 
        if (img) {
            let loadingToast = toast.loading("Uploading...");
            var reader = new FileReader();
            reader.readAsDataURL(img);
            reader.onload = () => {
                console.log(reader.result);
                setBlog({ ...blog, banner: reader.result })
            }
            reader.onerror = err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            }
            toast.dismiss(loadingToast);
            toast.success("Uploaded !");
        }
    }
    */
    
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
                setBlog({ ...blog, banner: canvas.toDataURL('image/jpeg') });

                toast.dismiss(loadingToast);
                toast.success("Uploaded !");
            };

            imgElement.src = URL.createObjectURL(img);
        }
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) { // to prevent enter keys from getting registered in the title
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px"; // to make textarea height dynamic and avoid scrollbar
        
        setBlog({ ...blog, title: input.value });

    }

    const handlePublishEvent = () => {
        if (!banner.length) {
            return toast.error("Upload a blog banner to publish")
        }
        if (!title.length) {
            return toast.error("Write blog title to publish")
        }
        if (textEditor.isReady) {
            textEditor.save().then(data => {
                // console.log(data);
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish");
                    textEditor.isReady = false;
                } else {
                    return toast.error("Write something in your blog to publish");
                }
            })
            .catch(err => {
                //console.log(err);
                return toast.error("Error while saving text");
            })
        }

    }

    const handleSaveDraft = (e) => {
        if (e.target.className.includes("disable")) {
			return ;
		}

		if (!title.length) {
			return toast.error("Title shouldn't be Empty")
		}

		let loadingToast = toast.loading("Saving Draft...");

		e.target.classList.add('disable');

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id: blog_id}, {
                    headers: {
                        "Authorization": `Bearer ${access_token}`
                    }
                })
                .then(() => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    toast.success("Drafted Successfully");
        
                    setTimeout(() => {
                        navigate("/dashboard/blogs?tab=draft"); // to navigate back to dashboards/blogs page after publishing
                    }, 500);
        
                })
                .catch(({ response, message }) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    if (response)
                        return toast.error(response.data.error); // to access the error from data sent from the backend
                    return toast.error(message);
                })
            })
        }
    }

    const handleError = (e) => {
        let img = e.target;

        img.src = theme == "light" ? lightBanner : darkBanner;
    }

  return (
    <>
        <nav className="navbar">
            <Link to="/" className="flex-none w-10">
                <img src={ theme == "light" ? darkLogo : lightLogo } className = "w-full" alt="logo" />
            </Link>
            <p className="max-md:hidden text-black line-clamp-1 w-full">
                { title && title.length ? title : "New Blog" }
            </p>

            <div className="flex gap-4 ml-auto">
                <button className="btn-dark py-2" onClick={handlePublishEvent}>
                    Publish
                </button>
                <button className="btn-light py-2" onClick={handleSaveDraft}>
                    Save Draft
                </button>
            </div>

        </nav>

        <Toaster />
        <AnimationWrapper>
            <section>
                <div className="mx-auto max-w-[900px] w-full">
                    <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                        <label htmlFor="uploadBanner">
                            <img src={banner} className="z-20" alt="blog banner" onError={handleError} />

                            <input id="uploadBanner" onChange={convertToBase64} type="file" accept=".png, .jpg, .jpeg" hidden/>
                        </label>
                    </div>

                    <textarea   defaultValue={title ? title : ""}
                                className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white" 
                                onKeyDown={handleTitleKeyDown}
                                onChange={handleTitleChange}
                                placeholder="Blog Title">
                    </textarea>

                    <hr className="w-full opacity-10 my-5"/>

                    <div id="textEditor" className="font-gelasio"></div>
                </div>
            </section>
        </AnimationWrapper>
    </>
  )
}

export default BlogEditor;

/*
bug 1:
- going to publish page and coming back to text Editor page doesnt show the blog text content
- shrinks the height of the textEditor to 0 (351 default)
*/