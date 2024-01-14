import {createProductHandle, getAllCategoriesToProduct, uploadImagesDragAndDrop, validationObserver } from "./product";

//constants
const productForm = document.getElementById("productForm");


const createHandle = () => {

        //handle tinyCce
        tinymce.init({
            selector: 'textarea#default-editor',
            setup: (editor) => {
                editor.on('keyup', (e) => {

                    if(!e.target.textContent)
                    {
                        document.querySelector(".tox").style.border = "1px solid #fa172c70";
                    }
                    else
                    {
                        document.querySelector(".tox").style.border = "1px solid #17fa1770";
                    }

                })
            }
        });
    

        uploadImagesDragAndDrop();

        getAllCategoriesToProduct();

        validationObserver();

        create();


}


//handle create Products
const create = () => {

    document.getElementById("submitProduct").addEventListener("click" , (event) => {


        event.preventDefault();
    
        createProductHandle(productForm).then((result) => {


            if(result.done == true)
            {


                productForm.reset();


                location.assign("/adminPanel/dashboard/home");



            }

        })
        .catch((result) => {

            document.querySelector(".errorList").textContent = result.err
            
            //change status of submit button and disabled it then show loading server

            document.getElementById("submitProduct").classList.remove("disabled");

            document.getElementById("submitProduct").innerHTML = 
            `
                Create Product

            `

        })
    
    });
    

}








createHandle();

