// importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

// as per documentation of editor.js
const uploadImageByURL = (e) => {
    let link = new Promise(( resolve, reject ) => {
        try {
            resolve(e)
        } catch {
            reject(err)
        }
    })
    return link.then(url => {
        return {
            success: 1,
            file: { url }
        }
    })
}

// const uploadImageByFile = (e) => {
// }

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                //uploadByFile: uploadImageByFile
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [1, 2, 3],
            default: 2
        }
    },
    quote: Quote,
    marker: Marker,
    inlineCode: InlineCode
}