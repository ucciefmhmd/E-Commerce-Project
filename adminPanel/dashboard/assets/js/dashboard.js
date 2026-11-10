import { onAuthStateChanged , getAuth } from "firebase/auth";
import {createCategory, getCategories , getSingleCategoriesById, toggleStatusCategory, updateCategory } from "../../../categories/assets/js/categories";
import { confirmationAlert } from "../../../shared/extensions";
import Swal from "sweetalert2";
import { app, firestore } from "../../../../main";
import { addSaleHandle, deleteProduct, getAllProducts, toggleStatusProduct } from "../../../products/assets/js/product";
import { createUserHandle, getAllUser, getSingleUserById } from "../../../users/assets/js/users";
import { doc, onSnapshot } from "firebase/firestore";
import { getAllOrders, handleConfirmOrder } from "../../../orders/assets/js/orders";
import { getCustomers } from "../../../customers/assets/js/customers";
import { handleAdminDropdownToggle, handleAdminLogout, renderAdminDropdown } from "../../../shared/adminNavbar";
import { safeUrl } from "../../../shared/helpers";

//constants
let updated = false;

//handle dashboard methods
const authentication = getAuth(app);
const modelForm = document.getElementById("modalForm");
const userForm = document.getElementById("userForm");



const dashboardHandle = () => {

    //check authentication login
    handleAdminLogout(authentication);

    //check if user in authentication login.
    onAuthStateChanged(authentication , (user) => {


        if(user){

            //handle loading
            document.querySelector(".overlay-loading").style.display = "none";

            //user
            const documentationReference = doc(firestore , "Users" , user.uid);
            onSnapshot(documentationReference , (snapshot) => {
                renderAdminDropdown(snapshot.data() , user.uid);
            });

        }
        else
        {
            location.assign("/adminPanel/authentication/login");
        }
        
    });


    handleAdminDropdownToggle();


    //users
    getAllUser();
    showUsersModal();
    createUser();

    //customers
    getCustomers();

    //categories
    getCategories();
    toggleStateCategoryHandle();
    showCategoryModal();
    saveCategoryHandle(modelForm);

    //products
    getAllProducts();
    toggleStateProductHandle();
    deleteProductHandle();
    showSaleModal();
    addSale();

    //orders
    getAllOrders();
    handleConfirmOrder();
}




//handle categories.

const showCategoryModal = () => {

    function windowOnClick(event) {
        if (event.target === document.getElementById("categoryModal")) {
            document.getElementById("categoryModal").classList.remove("show-modal")
        }
    }

    document.querySelector(".category-modal .close-button").addEventListener("click", () => {document.getElementById("categoryModal").classList.remove("show-modal")});
    document.querySelector(".category-modal .close-btn").addEventListener("click", () => {document.getElementById("categoryModal").classList.remove("show-modal")});
    window.addEventListener("click", windowOnClick);


    document.addEventListener("click" , async (event) => {

        if(event.target.classList.contains("js-create-category-btn"))
        {   
            event.preventDefault();

            document.getElementById("categoryModal").classList.toggle("show-modal");



            document.getElementById("previewImg").src = "https://www.pulsecarshalton.co.uk/wp-content/uploads/2016/08/jk-placeholder-image.jpg";

            document.getElementById("categoryTitle").textContent = "Create new category";

            document.getElementById("categoryName").value = "";

            document.getElementById("categoryImage").value = "";
            
            document.getElementById("validationCategorySpan").textContent = "";


            document.getElementById("submitCategoryBtn").textContent = "Save";

            document.getElementById("submitCategoryBtn").classList.replace("btn-warning" , "btn-primary");

            updated = false;

        }


        
        if(event.target.classList.contains("js-update-category-btn"))
        {
            document.getElementById("categoryModal").classList.toggle("show-modal");


            document.getElementById("previewImg").src = "https://www.pulsecarshalton.co.uk/wp-content/uploads/2016/08/jk-placeholder-image.jpg";

            //get updated object
            const updatedCategory = await getSingleCategoriesById(event.target.dataset.id);


            document.getElementById("previewImg").src = safeUrl(updatedCategory.Image[0].url);

            
            document.getElementById("validationCategorySpan").textContent = "";


            document.getElementById("categoryName").value = updatedCategory.Name;
            document.getElementById("categoryId").value = event.target.dataset.id;


            document.getElementById("categoryTitle").textContent =`Edit ${updatedCategory.Name} category`;

            document.getElementById("submitCategoryBtn").textContent = "Edit";

            document.getElementById("submitCategoryBtn").classList.replace("btn-primary" , "btn-warning");




            updated = true;

        }




    });

    
}


const saveCategoryHandle = (form) => {
    document.getElementById("submitCategoryBtn").addEventListener("click" , async (event) => {



        //check update or create
        if(updated == false) { //create
        
            createCategory(form).then((result) => {


                if(result.done == true)
                {

                    document.getElementById("submitCategoryBtn").classList.remove("disabled");
    
                    document.getElementById("submitCategoryBtn").innerHTML = 
                    `
        
                        Save
        
                    `

                    document.getElementById("categoryModal").classList.remove("show-modal");
        
                    form.reset();

                }


            })
            .catch((result) => {

                document.getElementById("validationCategorySpan").textContent = result.err;
    
            });
        }
        else
        { //update
            //get categoryId from hidden input.
            const categoryId = document.getElementById("categoryId").value;

            updateCategory(form , categoryId).then((result) => {
    
                if(result.done == true) {

                    document.getElementById("validationCategorySpan").textContent = "";

                    document.getElementById("submitCategoryBtn").classList.remove("disabled");
    
                    document.getElementById("submitCategoryBtn").innerHTML = 
                    `
        
                        Save
        
                    `
        
                    document.getElementById("categoryModal").classList.remove("show-modal");

                    form.reset();

                    updated = false;

                }
            }
            
        )
        .catch((result) => {

            document.getElementById("validationCategorySpan").textContent = result.err;

        });

        }



    });
}


const toggleStateCategoryHandle = () => {

    document.addEventListener("click" , (event) => {



        if(event.target.classList.contains("js-toggle-category-btn")) {
            var targetRaw = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement; 

            confirmationAlert("Are you sure want toggle this item" , "toggle").then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Successfully!",
                        text: "Your file has been changed.",
                        icon: "success"
                    }).then(async () => {
                        
                        targetRaw.classList.add("animate__animated" , "animate__shakeX");

                        await toggleStatusCategory(event.target.dataset.id);
                    })
                }
            });

        }

    });

}

//handle products

const toggleStateProductHandle = () => {

    document.addEventListener("click" , (event) => {



        if(event.target.classList.contains("js-toggle-product-btn")) {
            var targetRaw = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement; 

            confirmationAlert("Are you sure want toggle this item" , "toggle").then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Successfully!",
                        text: "Your file has been changed.",
                        icon: "success"
                    }).then(async () => {
                        
                        targetRaw.classList.add("animate__animated" , "animate__shakeX");

                        await toggleStatusProduct(event.target.dataset.id);
                    })
                }
            });

        }

    });

}



const deleteProductHandle = () => {

    document.addEventListener("click" , (event) => {



        if(event.target.classList.contains("js-delete-product-btn")) {
            var targetRaw = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement; 
            confirmationAlert("Are you sure want delete this item" , "delete").then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Successfully!",
                        text: "Your file has been changed.",
                        icon: "success"
                    }).then(async () => {
                        await deleteProduct(event.target.dataset.id);
                    })
                }
            });

        }

    });

}


//handle users
const showUsersModal = () => {

    //registered once (they used to be added again on every click anywhere on the page)
    function windowOnClick(event) {
        if (event.target === document.getElementById("usersModal")) {
            document.getElementById("usersModal").classList.remove("show-modal")
        }
    }

    document.querySelector(".user-modal .close-button").addEventListener("click", () => {document.getElementById("usersModal").classList.remove("show-modal")});
    document.querySelector(".user-modal .close-btn").addEventListener("click", () => {document.getElementById("usersModal").classList.remove("show-modal")});
    window.addEventListener("click", windowOnClick);

    document.addEventListener("click" , async (event) => {


        if(event.target.classList.contains("js-create-user-btn"))
        {
            event.preventDefault();

            document.getElementById("usersModal").classList.toggle("show-modal");
            
            document.getElementById("userTitle").textContent = "Create new User";

            document.getElementById("userEmail").value = "";

            document.getElementById("userPassword").value = "";
            
            document.getElementById("validationUserSpan").textContent = "";


            document.getElementById("submitUserBtn").textContent = "Save";

            document.getElementById("submitUserBtn").classList.replace("btn-warning" , "btn-primary");

        }


        
        if(event.target.classList.contains("js-update-user-btn"))
        {

            event.preventDefault();

            //get updated object
            const updatedUser = await getSingleUserById(event.target.dataset.id);

            document.getElementById("usersModal").classList.toggle("show-modal");
            
            document.getElementById("validationUserSpan").textContent = "";


            document.getElementById("userEmail").value = updatedUser.Email;
            document.getElementById("userId").value = event.target.dataset.id;

            document.getElementById("userTitle").textContent = `Edit ${updatedUser.Username} User`;

            document.getElementById("submitUserBtn").textContent = "Edit";

            document.getElementById("submitUserBtn").classList.replace("btn-primary" , "btn-warning");

        }

    });

}

//handle createUser for create user by admin
const createUser = () => {
    document.getElementById("submitUserBtn").addEventListener("click" , () => {

        createUserHandle(userForm).then((data) => {
            
            if(data.done){
                    document.getElementById("submitUserBtn").classList.remove("disabled");

                    document.getElementById("submitUserBtn").innerHTML = 
                    `
                        Save
        
                    `

                    document.getElementById("usersModal").classList.remove("show-modal");
        
                    userForm.reset();


                }
                
            })
            .catch((data) => {
                document.getElementById("submitUserBtn").classList.remove("disabled");

                document.getElementById("submitUserBtn").innerHTML = 
                `
                    Save
    
                `

                document.getElementById("validationUserSpan").textContent = data.err;

            });

    });
}

const showSaleModal = () => {



    function windowOnClick(event) {
        if (event.target === document.getElementById("saleModal")) {
            document.getElementById("saleModal").classList.remove("show-modal");
        }
    }

    document.querySelector(".sale-modal .close-button").addEventListener("click", () => {document.getElementById("saleModal").classList.remove("show-modal");});
    document.querySelector(".sale-modal .close-btn").addEventListener("click", () => {document.getElementById("saleModal").classList.remove("show-modal");});
    window.addEventListener("click", windowOnClick);

    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("js-add-sale-product")){

            document.getElementById("saleId").value = event.target.dataset.id;

            document.getElementById("saleModal").classList.toggle("show-modal");

        }

    });

}

const addSale = () => {
    document.getElementById("submitSaleBtn").addEventListener("click" , (event) => {

        event.preventDefault();

        const discountValue = document.getElementById("discountPercentage").value;

        if(!discountValue)
        {
            document.getElementById("validationSaleSpan").textContent = "discount field must be required..!!";
        }
        else if(discountValue > 100 || discountValue < 0) {
            document.getElementById("validationSaleSpan").textContent = "discount field must be bet 0 and 100..!!";
        }
        else
        {

            document.getElementById("validationSaleSpan").textContent = "";

            const productId = document.getElementById("saleId").value;

            //change status of submit button and disabled it then show loading server

            document.getElementById("submitSaleBtn").classList.add("disabled");

            document.getElementById("submitSaleBtn").innerHTML = 
            `
                <div class="spinner-border text-light me-1" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Looding..

            `

            addSaleHandle(discountValue , productId).then((data) => {
                if(data.done){
                    

                    //change status of submit button and disabled it then show loading server

                    document.getElementById("submitSaleBtn").classList.remove("disabled");

                    document.getElementById("submitSaleBtn").innerHTML = 
                    `
                        Save

                    `

                    document.getElementById("saleId").value = "";
                    document.getElementById("discountPercentage").value = "";
                    
                    document.getElementById("saleModal").classList.remove("show-modal");

                }
            })
            .catch((data) => {
                document.getElementById("validationSaleSpan").textContent = data.err;
            })



        }

    });
}

dashboardHandle();

