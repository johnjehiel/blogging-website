import toast, { Toaster } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";


const PublishForm = () => {
	let characterLimit = 200;
	let tagLimit = 10;

	let { blog_id } = useParams();
	

	let {
		blog,
		blog: { banner, title, tags, des ,content},
		setEditorState,
		setBlog,
	} = useContext(EditorContext);

	let { userAuth: { access_token } } = useContext(UserContext); // userAuth has the access token

	let navigate = useNavigate();

	const handleCloseEvent = () => {
		setEditorState("editor");
	};

	const handleBlogTitleChange = (e) => {
		setBlog({ ...blog, title: e.target.value });
	};

	const handleBlogDesChange = (e) => {
		setBlog({ ...blog, des: e.target.value });
	};

	const handleTitleKeyDown = (e) => {
		if (e.keyCode == 13) {
			// to prevent enter keys from getting registered in the title
			e.preventDefault();
		}
	};

	const handleKeyDown = (e) => {
		if (e.keyCode == 13 || e.keyCode == 188 ) {
			e.preventDefault();
			let tag = e.target.value;
			if (tags.length < tagLimit) {
				if (!tags.includes(tag) && tag.length) {
					setBlog({ ...blog, tags: [ ...tags, tag ] });
				}
			} else {
				toast.error(`Tag limit reached: ${tagLimit}`)
			}
			e.target.value = "";
		}
	}

	const publishBlog = (e) => {

		if (e.target.className.includes("disable")) {
			return ;
		}

		if (!title.length) {
			return toast.error("Title shouldn't be Empty")
		}
		if (!des.length) {
			return toast.error("Description Shouldn't be Empty");
		}
		if (des.length > characterLimit) {
			return toast.error(`Character Limit Exceeded (${characterLimit})`)
		}
		if (!tags.length) {
			return toast.error("Tag limit: Minimum 1 tag");
		}

		let loadingToast = toast.loading("Publishing...");

		e.target.classList.add('disable');

		let blogObj = {
			title, banner, des, content, tags, draft: false
		}

		axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		})
		.then(() => {
			e.target.classList.remove('disable');
			toast.dismiss(loadingToast);
			toast.success("Published Successfully");

			setTimeout(() => {
				navigate("/dashboard/blogs"); // to navigate back to dashboard/blogs page after publishing
			}, 500);

		})
		.catch(({ response, message }) => {
			e.target.classList.remove('disable');
			toast.dismiss(loadingToast);

			if (response)
				return toast.error(response.data.error); // to access the error from data sent from the backend
			return toast.error(message);
		})
	}

	return (
		<AnimationWrapper>
			<section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
				<Toaster />

				<button
					className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
					onClick={handleCloseEvent}
				>
					<i className="fi fi-br-cross"></i>
				</button>

				<div className="max-w-[550px] center">
					<p className="text-dark-grey mb-1">Preview</p>
					<div className="w=full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
						<img src={banner} alt="banner" />
					</div>
					<h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
						{title}
					</h1>
					<p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
						{des}
					</p>
				</div>

				<div className="border-grey lg:border-1 lg:pl-8">
					<p className="text-dark-grey mb-2 mt-9">Blog Title</p>
					<input
						type="text"
						placeholder="Blog Title"
						onChange={handleBlogTitleChange}
						className="input-box pl-4"
						defaultValue={title}
					/>

					<p className="text-dark-grey mb-2 mt-9">
						Short description about your blog
					</p>
					<textarea
						maxLength={characterLimit}
						defaultValue={des}
						className="h-40 resize-none leading-7 input-box pl-4"
						onChange={handleBlogDesChange}
						onKeyDown={handleTitleKeyDown}
					></textarea>
					<p className="mt-1 text-dark-grey text-sm text-right">
						{des.length}/{characterLimit} characters
					</p>

					<p className="text-dark-grey mb-2 mt-9">
						Topics - (Helps in Searching)
					</p>
					<div className="relative input-box pl-2 py-2 pb-4">
						<input type="text" placeholder="Topic"
								className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
								onKeyDown={handleKeyDown}/>
						{ 
							tags.map((tag, index) => {
								return <Tag tag={tag} tagIndex={index} key={index}/>
							}) 
						}
					</div>
					<p className="mt-1 mb-4 text-dark-grey text-sm text-right">{tags.length}/{tagLimit} Tags</p>

					<button className="btn-dark px-8" onClick={publishBlog}>Publish</button>
				</div>
			</section>
		</AnimationWrapper>
	);
};

export default PublishForm;