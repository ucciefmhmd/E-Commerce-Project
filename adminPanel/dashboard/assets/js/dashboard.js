import { onAuthStateChanged , getAuth , signOut} from "firebase/auth";
import {createCategory, getCategories , getSingleCategoriesById, toggleStatusCategory, updateCategory } from "../../../categories/assets/js/categories";
import { confirmationAlert } from "../../../shared/extensions";
import Swal from "sweetalert2";
import { app} from "../../../../main";
import { addSaleHandle, deleteProduct, getAllProducts, toggleStatusProduct } from "../../../products/assets/js/product";
import { createUserHandle, getAllUser, getSingleUserById } from "../../../users/assets/js/users";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getAllOrders, handleConfirmOrder } from "../../../orders/assets/js/orders";
import { getCustomers } from "../../../customers/assets/js/customers";

//constants
let updated = false;

//handle dashboard methods
const authentication = getAuth(app);
const modelForm = document.getElementById("modalForm");
const userForm = document.getElementById("userForm");
const firestore = getFirestore();



const dashboardHandle = () => {

    //check authentication login
    authenticationLogout();

    //check if user in authentication login.
    onAuthStateChanged(authentication , (user) => {


        if(user){

            //handle loading
            document.querySelector(".overlay-loading").style.display = "none";

            //user
            const documentationReference = doc(firestore , "Users" , user.uid);
            onSnapshot(documentationReference , (snapshot) => {

                const data = snapshot.data();

                document.querySelector(".dropdown").innerHTML = 
                `
                <a class="text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="profile-info d-flex justify-content-center align-items-center" style="z-index:1000000">
                        <div class="dropdown-info" style="padding:0px 20px; color: #000'">
                            <p class="dropdown-username" style="padding-bottom:0px; margin-bottom:0px">Hey, <b class="b">${data.Username}</b></p>
                            <small class="dropdown-role">${data.Role.toLowerCase()}</small>
                        </div>
                        <div class="profile-photo d-flex align-items-center">
                            <img width="40" height="40" src="${!data.ProfileImage.imageUrl ? '../dashboard/assets/images/avatar.png' : data.ProfileImage.imageUrl}">
                        </div>
                    </div>
                </a>
                <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/adminPanel/users/profile?id=${user.uid}">Profile</a></li>
                <li><a class="dropdown-item" href="/adminPanel/users/changeEmail?id=${user.uid}">Change Email</a></li>
                <li><a class="dropdown-item" href="/adminPanel/users/changePassword?id=${user.uid}">Change Password</a></li>
                <li><a class="dropdown-item logout-btn" href="javascript:;">Logout</a></li>
                </ul>
                `

                
                if(localStorage.getItem("mode")) {
                    if(localStorage.getItem("mode") === "dark")
                    {
                        document.querySelector(".dropdown-menu").classList.add("dropdown-menu-dark");                    
                    }
                    else
                    {
                        document.querySelector(".dropdown-menu").classList.remove("dropdown-menu-dark");                    
                    }
                }
            });

        }
        else
        {
            location.assign("/adminPanel/authentication/login");
        }
        
    });


    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("dropdown-info") || event.target.classList.contains("dropdown-role") || event.target.classList.contains("dropdown-username") || event.target.classList.contains("b")){
            console.log("xxx")
            document.querySelector(".dropdown-menu").classList.toggle("active");
        }
    
    });


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




const authenticationLogout = () => {

    document.addEventListener("click" , async (event) => {

        if(event.target.classList.contains("logout-btn")) {

            console.log("logout");

            try {

                await signOut(authentication);
                location.assign("http://localhost:5173/adminPanel/authentication/login");

            }
            catch(error) {

                console.log(error);

            }

        }

    });

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


            document.getElementById("previewImg").src = updatedCategory.Image[0].url;

            
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
            console.log("updated")
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

    document.addEventListener("click" , async (event) => {

        function windowOnClick(event) {
            if (event.target === document.getElementById("usersModal")) {
                document.getElementById("usersModal").classList.remove("show-modal")
            }
        }
    
        document.querySelector(".user-modal .close-button").addEventListener("click", () => {document.getElementById("usersModal").classList.remove("show-modal")});
        document.querySelector(".user-modal .close-btn").addEventListener("click", () => {document.getElementById("usersModal").classList.remove("show-modal")});
        window.addEventListener("click", windowOnClick);


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




            userUpdate = true;

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

