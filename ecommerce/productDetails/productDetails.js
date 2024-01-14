import { addDoc, collection, doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { addToCartHandle, addToWishlistHandle, getSingleProductById } from "../../adminPanel/products/assets/js/product";
import { calculateRating, getFormData } from "../../adminPanel/shared/extensions";
import { app } from "../../main";

let params = new URLSearchParams(location.search);
const id = params.get('id');

//Constants
const firestore = getFirestore(app);
const reviewForm = document.getElementById("reviewForm");
const collectionReviewReference = collection(firestore , "Reviews");
const collectionProductsReference = collection(firestore , "Products");
let ratingCurrentIndex;


const productDetailsHandle = () => {

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelector(".overlay-loading").style.display = "none";
    });


    displayTargetProduct(); //display target product in page
    productSmallImagesList(); //handle small images list to fire when clicked
    productSliderImagesList(); //handle slider images
    productTabsHandle(); //handle tabs
    addToWishlist(); //handle add to wishlist
    addToCart(); //handle add to cart
    relatedSlider(); //handle related products slider
    getRelatedProducts(); //handle get related products
    userRatingHandle(); //handle user rating
    sendUserReviewAboutProduct(); //handle send review email

}



//get single product and display it
const displayTargetProduct = async() => {
    

    const documentationReference = doc(firestore , `Products/${id}`);

    onSnapshot(documentationReference , (snapshot) => {

        const product = snapshot.data();

        let smallImgListItems = "";

        //loop on product of images to create small images
        product.Images.forEach((img , index) => {

            if(index == 0) //to set active class on first item
            {
                smallImgListItems +=
                `
        
                    <li class="small-image-item active">
                        <img class="small-img" src=${img.url} alt="small" data-index=${index}>
                    </li>
        
                `
            }
            else
            {
                smallImgListItems += 
                `
                <li class="small-image-item">
                    <img class="small-img" src=${img.url} alt="small" data-index=${index}>
                </li>
                `
            }



        });

        document.querySelector(".small-images-list").innerHTML = smallImgListItems;
        document.getElementById("previewImage").src = product.Images[0].url;

        //handle product information
        document.querySelector(".product-name").textContent = product.Name;
        document.querySelector(".product-category").textContent = product.Category;


        //handle rating stars...
        let numOfStars = calculateRating(parseInt(product.Rating));

        let stars = ""; 

        for (let index = 0; index < 5; index++) {

            if(numOfStars.numberOfFillStarsFloor != 0) {
                stars += `<img src="/images/Filled_star.png" class="raiting" alt="raiting">`;
                numOfStars.numberOfFillStarsFloor--;
            }
            else
            {
                stars += `<img src="/images/empty_star.png" class="raiting" alt="raiting">`;
            }
        };

        document.querySelector(".product-rating").innerHTML = stars;
        

        //handle status of product
        if(product.Status)
        {
            document.querySelector(".product-status").textContent = "Available";
            document.querySelector(".product-status").style.backgroundColor = "#0fa423";
        }
        else
        {
            document.querySelector(".product-status").textContent = "Deleted";
            document.querySelector(".product-status").style.backgroundColor = "#d72215";
        }

        //handle small Description
        document.querySelector(".product-description").innerHTML = product.Description;

        //handle Price
        document.querySelector(".price-val").textContent = product.Price;

        //handle discount found
        if(product.HasDiscount)
        {
            document.querySelector(".product-discount").textContent = "Discount";
            document.querySelector(".product-discount").style.backgroundColor = "#0fa423";
        }
        else
        {
            document.querySelector(".product-discount").textContent = "No Discount";
            document.querySelector(".product-discount").style.backgroundColor = "#d72215";
        }

        //handle discount value
        if(parseInt(product.DiscountVal) > 0)
        {
            document.querySelector(".product-discount-percentage").textContent = product.DiscountVal + "%";
            document.querySelector(".product-discount-percentage").style.backgroundColor = "#0fa423";
        }
        else
        {
            document.querySelector(".product-discount-percentage").textContent = product.DiscountVal + "%";
            document.querySelector(".product-discount-percentage").style.backgroundColor = "#d72215";
        }

        //handle Quantity value
        document.querySelector(".current-quantity").textContent = product.Quantity;


        //handle actions time
        document.querySelector(".product-action-details").innerHTML = `
        <button class="js-add-cart" style="margin-right: 10px;">Add To Cart</button>
        <button class="js-add-favorite">Add To whishlist</button>
        `;

        
        //handle description tab
        document.getElementById("tabProductDescription").innerHTML = product.Description;

        //handle review product name tab
        document.querySelector(".review-Product-name").innerHTML = product.Name.substring(0 , 50) + '...';
        document.querySelector(".current-Rating-stars").innerHTML = `${stars} (${numOfStars.numberOfFillStars})`;

    });


    
}



//handle card footer ==> product tabs (description and others)
const productTabsHandle = () => {


    document.querySelectorAll(".product-description-tab-list > li").forEach((tabItem) => {

        tabItem.addEventListener("click" , function(){ //when click on tab item in list 

            //firstly remove class item from all tab items

            document.querySelectorAll(".product-description-tab-list > li").forEach((tabItem) => {
                tabItem.classList.remove("active");
            });

            //set class active on target tab item 

            this.classList.add("active");

            //second remove class active from all tabs container
            document.querySelectorAll(".product-description-tab .tab-container").forEach((tabContainer) => {

                tabContainer.classList.remove("active");

            });
            
            //set class active on target tab container

            const targetTabContainerId = this.dataset.id;
            
            document.getElementById(targetTabContainerId).classList.add("active");

            
        });


    });



};


//handle product small covers lightBox
const productSmallImagesList = () => {

    document.addEventListener("click" , (event) => {

        if(event.target.classList.contains("small-img")){

            //firstly remove class item from all images
            document.querySelectorAll(".small-images-list .small-image-item .small-img").forEach((item) => {
                item.parentElement.classList.remove("active");
            });

            //set class active on target small image 
            event.target.parentElement.classList.add("active");

            //change src of preview image.
            document.getElementById("previewImage").src = event.target.src;

        }

    });

}

//handle product slider covers lightBox
const productSliderImagesList = () => {

    let targetIndex = ""; //to get target index and store here after click
    let sourceImagesArr = []; //store all src of small images when click on show  

    //get array from small images to get all sources by using foreach
    let smallImages = [];

    //when click open overlay with slider
    document.querySelector(".preview-overlay span").addEventListener("click" , function(){

        smallImages = Array.from(document.querySelectorAll(".small-images-list .small-image-item .small-img"))

        smallImages.forEach((img) => {
            //store all src of images in array to use it in preview after click control buttons
            sourceImagesArr.push(img.src);

        });

        //get target index using filter on active class 
        targetIndex = smallImages.filter((img) => img.parentElement.classList.contains("active"));
        targetIndex = targetIndex[0].dataset.index; //get target index

        //set source of target index in preview image
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];
        document.querySelector(".show-slider-image").style.display = "flex"; //display slider 

    });

    //handle controll button depend on increase and decrease targetIndex that get src form sourceImageArr.
    document.querySelector(".show-slider-image").addEventListener("click" , function(){
        sourceImagesArr = [];
        this.style.display = "none";

    });

    document.querySelector(".show-slider-image .previous-btn").addEventListener("click" , function(event){
        event.stopPropagation();
        
        if(targetIndex <= 0) 
            targetIndex = sourceImagesArr.length - 1;
        else
            targetIndex--;
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];

    });

    document.querySelector(".show-slider-image .next-btn").addEventListener("click" , function(event){
        event.stopPropagation();
        
        if(targetIndex >= (sourceImagesArr.length - 1)) 
            targetIndex = 0;
        else
            targetIndex++;
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];

    });

}


//handle product whishlist Cart
const addToWishlist = () => {

    document.body.addEventListener("click" , async(event) => {
        if(event.target.classList.contains("js-add-favorite")) {
           
            await addToWishlistHandle(id)
        }
    })


}


//handle product shopping Cart 
const addToCart = () => {

    document.body.addEventListener("click" , async(event) => {
        if(event.target.classList.contains("js-add-cart")) {

            await addToCartHandle(id)

        }
    })


}


const userRatingHandle = () => {


const raitingImages = document.querySelectorAll(".raiting");
let isFilled = false;


//handle rating mouse enter
raitingImages.forEach((element , index) => {
    element.addEventListener("mouseenter" , function(){

        isFilled = Array.from(raitingImages).some(function(element) {
            return element.getAttribute("data-filled") == "true";
        });

        if(isFilled) {
            let target = document.querySelector("[data-filled = 'true']");
            ratingCurrentIndex = target.dataset.index;
        }

        let myIndex = element.dataset.index;

        for (let index = 0; index <= myIndex; index++) {
            raitingImages[index].src = "/images/Filled_star.png";
        }
    })
});


//handle rating mouse leave
raitingImages.forEach((element , index) => {
    element.addEventListener("mouseleave" , function(){

        if(ratingCurrentIndex != undefined) {

            raitingImages.forEach((element) => {
                element.removeAttribute("data-filled");
            });

            let len = raitingImages.length - ratingCurrentIndex; //5 - 2

            for (let index = 1; index <= len; index++) {
                raitingImages[raitingImages.length - index].src = "/images/empty_star.png";
            }

            for (let index = 0; index <= ratingCurrentIndex; index++) {
                raitingImages[index].src = "/images/Filled_star.png";          
            }

            raitingImages[ratingCurrentIndex].setAttribute("data-filled" , true);
        }
        else {
            for (let index = 0; index < raitingImages.length; index++) {
                raitingImages[index].src = "/images/empty_star.png";          
            }
        }




    })
});


//handle rating click
raitingImages.forEach((element , index) => {
    element.addEventListener("click" , function(){

        for (let index = 0; index < raitingImages.length; index++) {
            raitingImages[index].src = "/images/empty_star.png";          
        }

        let myIndex = element.dataset.index;

        for (let index = 0; index <= myIndex; index++) {
            raitingImages[index].src = "/images/Filled_star.png";
        }

        element.setAttribute("data-filled" , true);

        ratingCurrentIndex = myIndex;

        console.log(ratingCurrentIndex)

    })
});


}



//handle send user review about product
const sendUserReviewAboutProduct = () => {
    
    document.querySelector(".js-submit-review").addEventListener("click" , async(event) => {

        event.preventDefault();

        //get data From Form
        const currentObject = getFormData(reviewForm);
        currentObject.RatingValue = ratingCurrentIndex ? (parseInt(ratingCurrentIndex) + 1) : 0;
        currentObject.Watched = false;
        currentObject.ProductId = id;
        

        ///validation
        const validationResult = reviewValidation(currentObject);

        if(validationResult.isValid) {
            document.getElementById("validationReviewSpan").textContent = "";

            document.querySelector(".js-submit-review").innerHTML = 
            `
            
                <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
                Loading...

            
            `
            //add review object in firebase
            try {
                addDoc(collectionReviewReference , currentObject).then(async() => {
                    //get current product to add review
                    const currentProduct = await getSingleProductById(id);

                    //increase rating
                    currentProduct.Rating = parseInt(currentProduct.Rating) + parseInt(currentObject.RatingValue);

                    //update Product
                    const documentReference = doc(firestore , `Products/${id}`);

                    updateDoc(documentReference , currentProduct).then(() => {

                        document.querySelector(".js-submit-review").innerHTML = 
                        `
                        
                            Submit
            
                        
                        `

                    })
                    .catch((error) => {
                        document.getElementById("validationReviewSpan").textContent = error;
                    })
                })
                .catch((error) => {

                    document.getElementById("validationReviewSpan").textContent = error;

                });
            }
            catch(error){

            }

            
        }
        else
        {
            document.getElementById("validationReviewSpan").textContent = validationResult.messageError;
        }

    });
}

//review validation
export const reviewValidation = (data) => {

    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.messageError = "";

    const regexEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi);
    const emailValid = regexEmail.test(data.Email);


    if(!data.Username){
        validationResult.messageError = "username must be required..!!";
    }
    else if(!data.Email) {
        validationResult.messageError = "email must be required..!!";
    }
    else if(!emailValid){
        validationResult.messageError = "invalid email..!!";
    }
    else if(data.Message == "Gave us your feedback about this product..." || !data.Message) {
        validationResult.messageError = "Message must be required..!!";
    }
    else
    {
        validationResult.isValid = true;
        validationResult.messageError = "";
    }

    return validationResult
}

//handle Related products Slider
const relatedSlider = () => {

    
const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".wrapper i");
const carouselChildrens = [...carousel.children];


// No. Cards fits the view
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// infinite scrolling by adding the last view card in the first
carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
});

// infinite scrolling by adding the last view card in the end
carouselChildrens.slice(0, cardPerView).forEach(card => {
    carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

// hide dupicate cards
carousel.classList.add("no-transition");
carousel.scrollLeft = carousel.offsetWidth;
carousel.classList.remove("no-transition");

// event to move the slider right & left
arrowBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
    });
});
    
}

const getRelatedProducts = async() => {
    //get current product to add review
    const currentProduct = await getSingleProductById(id);
    onSnapshot(collectionProductsReference , (snapshot) => {

        const products = [];

        snapshot.docs.forEach((doc) => {
            products.push({id:doc.id , ...doc.data()});
        })

        //filter products by category
        const relatedProducts = products.filter((product) => {
            return product.Category == currentProduct.Category && product.id != currentProduct.id;
        });

        const relatedTenProducts = relatedProducts.slice(0 , 10);
        setupRelatedProducts(relatedTenProducts);
    })
}

const setupRelatedProducts = (products) => {
    document.querySelector(".related-products-container .wrapper .carousel").innerHTML = ``;

    let relatedProductsCartona = ``;
            

    products.forEach((product) => {
       
        //handle rating stars...
        let numOfStars = calculateRating(parseInt(product.Rating));

        let stars = ""; 

        for (let index = 0; index < 5; index++) {

            if(numOfStars.numberOfFillStarsFloor != 0) {
                stars += `<img src="/images/Filled_star.png" class="raiting" alt="raiting">`;
                numOfStars.numberOfFillStarsFloor--;
            }
            else
            {
                stars += `<img src="/images/empty_star.png" class="raiting" alt="raiting">`;
            }
        };

        relatedProductsCartona +=
        `
        <li class="card">
            <div class="img"><img src="${product.Images[0].url}" alt="img" draggable="false"></div>
            <div class="descOfProduct">
                <p class="productCategory">${product.Category}</p>
                <p class="productName">
                    <a href="../productDetails/productDetails?id=${product.id}" title="${product.Name}">${product.Name}</a>
                </p>
                <div class="rating">
                    <div class="rating-container">
                        ${stars}
                    </div>
                    <span class="rating-value">(${numOfStars.numberOfFillStars})</span>
                </div>

                <p class="productPrice">${product.Price}.00 EPG</p>
            </div>
        </li>
        `
        
    });

    document.querySelector(".related-products-container .wrapper .carousel").innerHTML = relatedProductsCartona;
}


productDetailsHandle();