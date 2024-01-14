//imports
import {deleteObject, getDownloadURL, getStorage , ref, uploadBytesResumable} from "firebase/storage"; //upload image to firebase
import { addDoc, collection , deleteDoc, doc, getDoc, getFirestore , onSnapshot, updateDoc} from "firebase/firestore"; //store products
import { getAllCategories } from "../../../categories/assets/js/categories";
import {app} from "../../../../main"; //main

//constants
const firebaseStorage = getStorage(app);
const firestore = getFirestore();
const collectionReference = collection(firestore , "Products");

const images = []; //store images after handling drag and drop method

//get all Products
export const getAllProducts = () => {


    onSnapshot(collectionReference , (snapshot) => {


        const products = [];

        snapshot.docs.forEach((doc) => {

            products.push({id: doc.id , ...doc.data()});

        });


        generateProductsDatatable(products) //generate datatable
    });


}

//generate datatable for products
const generateProductsDatatable = (products) => {


    document.getElementById("productsDataContainer").innerHTML = "";


    $(".datatables-products-basic").DataTable().clear().draw();


    products.forEach((product) => {
        
        $(".datatables-products-basic").DataTable().row.add(product).draw();
        
    });


}


//get product by id
export const getSingleProductById = async(id) => {


    const documentReference = doc(firestore , `Products/${id}`);

    const product = await getDoc(documentReference);

    const currentObject = {id: product.id , ...product.data()};

    return currentObject;

}




//handle category select
export const getAllCategoriesToProduct = async() => {
    const categories =  await getAllCategories();
    categories.forEach((category) => {


        const option = document.createElement("option");

        const optionNodeText = document.createTextNode(category.Name);

        //attributes
        option.setAttribute("value" , category.Name);

        //append
        option.appendChild(optionNodeText);

        document.getElementById("productCategory").appendChild(option);


    });
}


//handle drag and drop
export const uploadImagesDragAndDrop = () => {
    const buttonUpload = document.querySelector(".top button");
    const browse = document.querySelector(".select");
    const input = document.querySelector(".form-upload input");

    browse.addEventListener("click" , () => { //to make input open from browse text

        input.click();

    });

    buttonUpload.addEventListener("click" , () => { //to make input open from browse text

        input.click();

    });


    //input change event
    input.addEventListener("change" , () => { 

        const imgs = Array.from(input.files);

        imgs.forEach((img) => { //add images from input in images array after chcek no consistency and length no more 5

            if(images.every((e) => {return e.name !== img.name}) && images.length < 5){
                images.push(img);
            }
            

        });

        input.value = ""; //empty file input 
        document.getElementById('previewImg').src = URL.createObjectURL(images[0]);
        showImages(images); //display in image container

    });


    //display selected images in container
    const showImages = (images) => {
        let cartona = "";

        images.forEach((img , index) => {

            cartona += 
            `
            <div class="image" style="margin-right:5px">
                <img src=${URL.createObjectURL(img)} alt="image">
                <span class="deleteImg" data-index=${index}>&times;</span>
            </div>
            `

        });

        document.querySelector(".image-container").innerHTML = cartona;
    }


    document.addEventListener("click" , (event) => {
        if(event.target.classList.contains("deleteImg")){
            console.log(event.target.dataset.index);
            images.splice(event.target.dataset.index , 1);
            document.getElementById('previewImg').src = URL.createObjectURL(images[0]);
            showImages(images);
        }
    });



    
}


//handle create product
export const createProductHandle = (form) => {

     //get form Data
    return new Promise( async (resolve , reject) => {

        const currentObject = getFormDataProduct(form);
        currentObject.Description = tinyMCE.activeEditor.getContent();
        currentObject.Images = images;

        //validation
        const validationResult = validationProduct(currentObject , false);

        if(validationResult.isValid)
        {   

            //change status of submit button and disabled it then show loading server

            document.getElementById("submitProduct").classList.add("disabled");

            document.getElementById("submitProduct").innerHTML = 
            `
                <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
                Loading...

            `


            try
            {
                //upload images firstly 
                currentObject.Images = await uploadImages(currentObject.Images);
                await addDoc(collectionReference , currentObject);
                resolve({done:true , err : ""});
            }
            catch(error)
            {
                reject({done:true , err : error});
            }

        }
        else
        {
            generateErrorList(validationResult.errorList);
        }

    });
    
}

//handle create product
export const updateProductHandle = (form , id) => {

    //get form Data
    return new Promise( async (resolve , reject) => {
        //old product
        const oldProduct = await getSingleProductById(id);

        console.log(oldProduct);

        const currentObject = getFormDataProduct(form);
        currentObject.Description = tinyMCE.activeEditor.getContent();
        currentObject.LastUpdatedAt = `${new Date()}`;
        currentObject.Images = images;

        console.log(currentObject);
        //validation
        const validationResult = validationProduct(currentObject , true);

        if(validationResult.isValid)
        {   

            //change status of submit button and disabled it then show loading server

            document.getElementById("submitProduct").classList.add("disabled");

            document.getElementById("submitProduct").innerHTML = 
            `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...

            `


            try
            {
                if(images.length > 0 && images.length == 5) //already admin update images
                {
                    //delete image firstly
                    oldProduct.Images.forEach((img) => {
                        deleteImage(img.fullPath);
                    });

                    //upload images secondly 
                    currentObject.Images = await uploadImages(currentObject.Images);
                }
                else
                {
                    currentObject.Images = oldProduct.Images;
                }

                const documentReference = doc(firestore , `Products/${id}`);

                await updateDoc(documentReference , currentObject);

                resolve({done:true , err : ""});
            }
            catch(error)
            {
                reject({done:true , err : error});
            }

        }
        else
        {
            generateErrorList(validationResult.errorList);
        }

    });

}



//handle product validation
export const validationObserver = () => {

    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productBrand = document.getElementById("productBrand");
    const productPrice = document.getElementById("productPrice");
    const productColor = document.getElementById("productColor");
    const productQuantity = document.getElementById("productQuantity");

    productName.onkeyup = function() {
        if(!productName.value) {
            productName.classList.remove("border-valid");
            productName.classList.add("border-invalid");
        }
        else
        {
            productName.classList.add("border-valid");
            productName.classList.remove("border-invalid");
        }
    }

    productCategory.onchange = function() {
        if(productCategory.value == "") {
            productCategory.classList.remove("border-valid");
            productCategory.classList.add("border-invalid");
        }
        else
        {
            productCategory.classList.add("border-valid");
            productCategory.classList.remove("border-invalid");
        }
    }

    productBrand.onchange = function() {
        if(productBrand.value == "") {
            productBrand.classList.remove("border-valid");
            productBrand.classList.add("border-invalid");
        }
        else
        {
            productBrand.classList.add("border-valid");
            productBrand.classList.remove("border-invalid");
        }
    }
    productColor.onchange = function() {
        if(productColor.value == "") {
            productColor.classList.remove("border-valid");
            productColor.classList.add("border-invalid");
        }
        else
        {
            productColor.classList.add("border-valid");
            productColor.classList.remove("border-invalid");
        }
    }
    
    productPrice.onkeyup = function() {
        if(productPrice.value <= 0) {
            productPrice.classList.remove("border-valid");
            productPrice.classList.add("border-invalid");
        }
        else
        {
            productPrice.classList.add("border-valid");
            productPrice.classList.remove("border-invalid");
        }
    }

    productQuantity.onkeyup = function() {
        if(productQuantity.value <= 0) {
            productQuantity.classList.remove("border-valid");
            productQuantity.classList.add("border-invalid");
        }
        else
        {
            productQuantity.classList.add("border-valid");
            productQuantity.classList.remove("border-invalid");
        }
    }

}

export const validationProduct = (currentObject , inUpdate) => {

    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productBrand = document.getElementById("productBrand");
    const productPrice = document.getElementById("productPrice");
    const productColor = document.getElementById("productColor");
    const productQuantity = document.getElementById("productQuantity");
    const productDescription = document.querySelector(".tox");


    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.errorList = [];

    let validName = true;
    let validCategory = true;
    let validPrice = true;
    let validQuantity = true;
    let validDescription = true;
    let validImages = true;
    let validColor = true;
    let validBrand = true;


    //handle number of images
    if(currentObject.Images.length <= 0 && !inUpdate) //create
    {
        validationResult.errorList.push("Product Image must be required..!!");
        validImages = false;
    }

    if(currentObject.Images.length > 0 && currentObject.Images.length != 5 )
    {
        validationResult.errorList.push("only 5 images allowed..!!");
        validImages = false;
    }

    //handle empty name
    if(!currentObject.Name)
    {
        validationResult.errorList.push("Product Name must be required..!!");
        productName.classList.remove("border-valid");
        productName.classList.add("border-invalid");
        validName = false;
    }
    else
    {
        productName.classList.add("border-valid");
        productName.classList.remove("border-invalid");
    }

    if(!currentObject.Category)
    {
        validationResult.errorList.push("Product Category must be required..!!");
        productCategory.classList.remove("border-valid");
        productCategory.classList.add("border-invalid");
        validCategory = false;
    }
    else
    {
        productCategory.classList.add("border-valid");
        productCategory.classList.remove("border-invalid");
    }

    if(!currentObject.Brand)
    {
        validationResult.errorList.push("Product Brand must be required..!!");
        productBrand.classList.remove("border-valid");
        productBrand.classList.add("border-invalid");
        validBrand = false;
    }
    else
    {
        productBrand.classList.add("border-valid");
        productBrand.classList.remove("border-invalid");
    }

    if(!currentObject.Color)
    {
        validationResult.errorList.push("Product Color must be required..!!");
        productColor.classList.remove("border-valid");
        productColor.classList.add("border-invalid");
        validColor = false;
    }
    else
    {
        productColor.classList.add("border-valid");
        productColor.classList.remove("border-invalid");
    }

    if(!currentObject.Description)
    {
        validationResult.errorList.push("Product Description must be required..!!");
        productDescription.style.border = "1px solid #fa172c70";
        validDescription = false;
    }
    else
    {
        productDescription.style.border = "1px solid #17fa1770";

    }
    if(currentObject.Price <= 0)
    {
        validationResult.errorList.push("Product Price must more than 0..!!");
        productPrice.classList.remove("border-valid");
        productPrice.classList.add("border-invalid");
        validPrice = false;

    }
    else
    {
        productPrice.classList.add("border-valid");
        productPrice.classList.remove("border-invalid");
    }

    if(currentObject.Quantity <= 0)
    {
        validationResult.errorList.push("Product Quantity must more than 0..!!");
        productQuantity.classList.remove("border-valid");
        productQuantity.classList.add("border-invalid");
        validQuantity = false;
    }
    else
    {
        productQuantity.classList.add("border-valid");
        productQuantity.classList.remove("border-invalid");
    }


    if(validName && validCategory && validDescription && validPrice && validQuantity && validImages && validColor && validBrand)
    {
        validationResult.isValid = true;
    }

    return validationResult;

}

//handle product validation generate error list from arr
export const generateErrorList = (errorList) => {

    document.querySelector(".errorList").innerHTML = "";


    const errorUl = document.createElement("ul");
    
    errorList.forEach(error => {

        const errorLi = document.createElement("li");
        const errorLiText = document.createTextNode(error);

        //style
        errorLi.classList.add("text-danger");

        //append text
        errorLi.appendChild(errorLiText);
        errorUl.appendChild(errorLi);

    });

    document.querySelector(".errorList").appendChild(errorUl);
}

//handle upload product images
export const uploadImages = (images) => {

    return new Promise((resolve , reject) => {

        const ImagesArr = [];

        let counter = 0;
    
        images.forEach((img) => {
    
    
            const storageReference = ref(firebaseStorage , `Products/${img.name}`)
    
            const metadata = {contentType : img.type};
    
            const uploadTask = uploadBytesResumable(storageReference , img , metadata);
    
            uploadTask.then((snapshot) => {
    
                getDownloadURL(storageReference).then((url) => {
                    let imgObject = {url: url , fullPath: snapshot.metadata.fullPath};
    
                    ImagesArr.push(imgObject);
    
                    counter++;
                    
                    if(images.length == counter)
                    {
                        resolve(ImagesArr);
                    }
    
                })
                .catch((err) => {
                    reject(err);
                })
    
            })
            .catch((err) => {
                reject(err);
            })
    
        });






    });



}

export const deleteImage = (fullPath) => {
    const firebaseStorage = getStorage(app);
    const storgeReference = ref(firebaseStorage , fullPath);
    deleteObject(storgeReference).then(() => {console.log("image deleted")})
    .catch((err) => {console.log(err)})
}


export const getFormDataProduct = (form) =>{

    //constants

//////////////////////
    const dataForm = new FormData(form);

        dataForm.append("CreateAt" , new Date());
        dataForm.append("LastUpdatedAt" , "");
        dataForm.append("Rating" , 0);
        dataForm.append("DiscountVal" , 0);
        dataForm.append("numberOfPurchasing" , 0);

        const dataFormArr = [...dataForm];

        const currentObject = new Object();

        currentObject.HasDiscount = false;
        currentObject.Status = true;

        dataFormArr.forEach((element) => {

            currentObject[element[0]] = element[1]

        });

        return currentObject;
}


//toggle product
export const toggleStatusProduct = async (id) => {

    const documentationReference = doc(firestore , "Products" , id);

    const currentObject = await getSingleProductById(id);

    currentObject.LastUpdatedAt = `${new Date()}`;
    currentObject.Status = !currentObject.Status;

    //update category document

    try{
        await updateDoc(documentationReference ,currentObject);
    }
    catch(error)
    {
        console.log(error);
    }


}




//delete product
export const deleteProduct = async (id) => {

    const documentationReference = doc(firestore , "Products" , id);

    //delete product document

    try{
        await deleteDoc(documentationReference);
    }
    catch(error)
    {
        console.log(error);
    }


}

//add sale
export const addSaleHandle = (sale , id) => {

    return new Promise(async(resolve , reject) => {

        const documentationReference = doc(firestore , "Products" , id);

        const product = await getSingleProductById(id);
        if(sale > 0) {
            product.HasDiscount = true;
            product.DiscountVal = sale;
            product.LastUpdatedAt = `${new Date()}`;
        }
        else
        {
            product.HasDiscount = false;
            product.DiscountVal = 0;
        }

        try {
            updateDoc(documentationReference , product).then((data) => {
                resolve({done:true , err: ""});
            })
            .catch((error) => {
                reject({done:false , err : error});
            })
        }
        catch(error)
        {
            reject({done:false , err: error});
        }


    });


}

//handle add to wishlist cart
export const addToWishlistHandle = async(id) => {
    const currentProduct = await getSingleProductById(id);

    let wishlistCartArray = [];
    //check if shoppingCart is found in localStorage
    if(localStorage.getItem("wishlistCart")){

        wishlistCartArray = JSON.parse(localStorage.getItem("wishlistCart"));

        //check if product is already existed

        if(!wishlistCartArray.some((product) => {return product.id == currentProduct.id})){

            wishlistCartArray.push(currentProduct);

                            
            //update in localStorage
            localStorage.setItem("wishlistCart" , JSON.stringify(wishlistCartArray));

            //increase favorite badge
            increaseFavCounter(wishlistCartArray);
        }
        else
        {
            console.log("this product is already existed...");
        }





    }
    else
    {
        
        localStorage.setItem("wishlistCart" , JSON.stringify([currentProduct]));
        document.getElementById("favBadge").innerHTML = 1;
    }
}

//handle add to shopping cart
export const addToCartHandle = async (id) => {
    const currentProduct = await getSingleProductById(id);
    currentProduct.quantityOrder = 1;

    let shoppingCartArray = [];
    //check if shoppingCart is found in localStorage
    if(localStorage.getItem("shoppingCart")){

        shoppingCartArray = JSON.parse(localStorage.getItem("shoppingCart"));

        //check if product is already existed

        if(!shoppingCartArray.some((product) => {return product.id == currentProduct.id})){
            shoppingCartArray.push(currentProduct);

                            
            //update in localStorage
            localStorage.setItem("shoppingCart" , JSON.stringify(shoppingCartArray));

            //increase shopping cart badge
            increaseShoppingCartCounter(shoppingCartArray);

        }
        else
        {
            console.log("this product is already existed...");
        }





    }
    else
    {
        
        localStorage.setItem("shoppingCart" , JSON.stringify([currentProduct]));
        document.getElementById("cartBagBadge").innerHTML = 1;
    }
}

//increase favorite badge counter handle
export const increaseFavCounter = (favoriteArr) => {

    let count = favoriteArr.length;

    document.getElementById("favBadge").innerHTML = count;

}

//increase shopping Cart counter badge handle
export const increaseShoppingCartCounter = (shoppingCartArr) => {

    let count = shoppingCartArr.length;

    document.getElementById("cartBagBadge").innerHTML = count;

}
