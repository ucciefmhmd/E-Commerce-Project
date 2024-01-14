//imports
import {createProductHandle, deleteImage, getAllCategoriesToProduct, getSingleProductById, updateProductHandle, uploadImagesDragAndDrop, validationObserver } from "./product";

//constants
const productForm = document.getElementById("productForm");

const params = new URLSearchParams(location.search);
const productId = params.get('id');


const updateHandle = () => {

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
    

        // uploadImagesDragAndDrop();
        uploadImagesDragAndDrop();

        //get All Categories for select
        getAllCategoriesToProduct();

        // validationObserver();
        validationObserver();

        //prepare form
        prepareProductUpdateForm();

        update();

}

//prepare form form upload
const prepareProductUpdateForm = async(form , id) => {
    const currentObject = await getSingleProductById(productId);

    productForm.Name.value = currentObject.Name;
    productForm.Category.value = currentObject.Category;
    productForm.Brand.value = currentObject.Brand;
    productForm.Color.value = currentObject.Color;
    productForm.Price.value = currentObject.Price;
    productForm.Quantity.value = currentObject.Quantity;
    tinyMCE.activeEditor.setContent(currentObject.Description);
    
    document.getElementById("previewImg").src = currentObject.Images[0].url;

    let cartona = "";

    currentObject.Images.forEach((img) => {

        cartona += 
        `
        <div class="image">
            <img src=${img.url} alt="image">
        </div>
        `

    });

    document.querySelector(".image-container").innerHTML = cartona;



    console.log(currentObject);
}



const update = () => {

    document.getElementById("submitProduct").addEventListener("click" , (event) => {


        event.preventDefault();
    
        updateProductHandle(productForm , productId).then((result) => {


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




updateHandle();