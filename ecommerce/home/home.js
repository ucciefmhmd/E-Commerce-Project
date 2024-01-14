//imports
import {collection, getFirestore , onSnapshot} from "firebase/firestore";
import { app } from "../../main";
import { calculateRating } from "../../adminPanel/shared/extensions";
import { addToCartHandle, addToWishlistHandle } from "../../adminPanel/products/assets/js/product";


//constants
const firestore = getFirestore(app);




const homeHandle = () => {
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelector(".overlay-loading").style.display = "none";
    });

    getCategoriesData();
    getProductsData();
    displayByCategory();
    addToCart();
    addToWishlist();
}



//get Categories Data from firebase
const getCategoriesData = () => {


    const collectionReference = collection(firestore , "Categories");

    const categories = [];

    onSnapshot(collectionReference , (snapshot) => {


        snapshot.docs.forEach((doc) => {

            categories.push({id:doc.id , ...doc.data()})

        });

        const availableCategories = categories.filter((category) => {return category.Status});

        setupCategories(availableCategories);


    });


}


//setup categories in home 
const setupCategories = (categories) => {

    document.querySelector(".carousel2").innerHTML = ``;

    let categoriesCartona = ``;

    categories.forEach((category) => {


        categoriesCartona +=
        `
            <li class="cardCategory" data-name="${category.Name}">
                <div class="img"><img class="img-thumbnail js-category-img" src=${category.Image[0].url} data-name="${category.Name}" alt="img" draggable="false"></div>
                <h3 class="js-category-heading" data-name="${category.Name}">${category.Name}</h3>
            </li>
        
        `

    });


    document.querySelector(".carousel2").innerHTML = categoriesCartona;




}


//get Products Data from firebase
const getProductsData = () => {


    const collectionReference = collection(firestore , "Products");

    const products = [];

    onSnapshot(collectionReference , (snapshot) => {


        snapshot.docs.forEach((doc) => {


            products.push({id:doc.id , ...doc.data()});

        });

        const availableProducts = products.filter((product) => {return product.Status});

        setupAllProducts(availableProducts);

        //prepere for best seller 
        const bestSeller = availableProducts.filter((product) => {return product.numberOfPurchasing >= 50})
        .sort((a , b) => {
            a.numberOfPurchasing - b.numberOfPurchasing
        })
        const bestSeller20 = bestSeller.slice(0 , 20);

        setupBestSellerProducts(bestSeller20);

        //prepate sale
        const saleProduct = availableProducts.filter((product) => {return product.HasDiscount})
        setupSaleProducts(saleProduct);
    });


}


//setup products in home 
const setupAllProducts = (products) => {

    document.querySelector(".carousel").innerHTML = ``;

    let productsCartona = ``;

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

        productsCartona +=
        `
        <li class="card">
            <div class="twoIcons">
                <p class="iconOnImage"><a href="javascript:;"><i class="fa-regular fa-heart js-add-wishlist" data-id=${product.id}></i></a></p>
                <p class="iconOnImage"><a href="/ecommerce/productDetails/productDetails?id=${product.id}"><i class="fa-regular fa-eye"></i></a></p>
                <p class="iconOnImage"><a  href="javascript:; "><i class="fa-brands fa-shopify js-add-cart" data-id=${product.id}></i></a></p>
            </div>
            <div class="img"><img src="${product.Images[0].url}" alt="img" draggable="false" ></div>
            <div class="descOfProduct">
                <p class="productCategory">${product.Category}</p>
                <p class="productName">
                <a href="ecommerce/productDetails/productDetails?id=${product.id}" title="${product.Name}">${product.Name.substring(0 , 60)}...</a>
                </p>
                <p class="rating">${stars}</p>
                <p class="productPrice">${product.Price}.00 EPG</p>
            </div>
        </li>
        
        `   

    });

    document.querySelector(".carousel").innerHTML = productsCartona;


}


//setup best seller products in home 
const setupBestSellerProducts = (products) => {

    document.querySelector(".carousel-seller").innerHTML = ``;


    let productsBestCartona = ``;

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
        productsBestCartona +=
        `
        <li class="card">
            <div class="img"><img src="${product.Images[0].url}" alt="img" draggable="false" ></div>
            <div class="descOfProduct">
                <p class="productCategory">${product.Category}</p>
                <p class="productName">
                <a href="ecommerce/productDetails/productDetails?id=${product.id}" title="${product.Name}">${product.Name.substring(0 , 60)}...</a>
                </p>
                <p class="rating">${stars}</p>
                <p class="productPrice">${product.Price}.00 EPG</p>
            </div>
        </li>
        
        `   

    });


    document.querySelector(".carousel-seller").innerHTML = productsBestCartona;


}

//setup best seller products in home 
const setupSaleProducts = (products) => {

    const specialOfferArray = products.filter((product) => {return product.DiscountVal >= 50 && product.Status});
    const specialOffer = specialOfferArray[0];

    products = products.slice(0 , 6);

    if(specialOffer != undefined){

        //setup special offer
        document.querySelector(".special-offer-container").innerHTML = 
        `
        
            <div class="special-offer">
                <div class="special-offer-details">
                    <h4>Special <br> Offer</h4>
                    <p>Save ${specialOffer.DiscountVal}%</p>
                </div>
                <div class="special-offer-cover">
                    <img src="${specialOffer.Images[0].url}" alt="special-offer" width="320">
                </div>
                <div class="special-offer-information">
                    <div class="special-offer-name">
                        <a href="/ecommerce/productDetails/productDetails?id=${specialOffer.id}">${specialOffer.Name.substring(0 , 60)}...</a>
                    </div>
                    <div class="special-offer-price">
                        <span class="special-old-price">${specialOffer.Price}.00EPG</span>
                        <span class="special-new-price">${getPriceAfterDiscount(specialOffer.Price , specialOffer.DiscountVal)}.00EPG</span>
                    </div>
                    <div class="special-offer-metter">
                        <div>
                            <span>Available: ${specialOffer.Quantity}</span>
                        </div>
                        <div class="special-metter">
                            <div class="counter"></div>
                        </div>
                        <div class="special-offer-footer">
                            <p>Hurry Up! Offer ends in:</p>
                            <p class="end-special-offer">11 jan 2024</p>
                        </div>
                    </div>
                </div>
            </div>
    
    
        `

        
    }
    else
    {
                //setup special offer
        document.querySelector(".special-offer-container").innerHTML = 
        `
        <div class="special-offer" style="position:relative; overflow:hidden">
            <div class="soon">Comming Soon...!!!</div>
            <div class="special-offer-details">
                <h4>Special <br> Offer</h4>
                <p>more than 50%</p>
            </div>
            <div class="special-offer-cover">
                <img src="imgs/sale/special-offer.jpg" alt="special-offer" width="320">
            </div>
            <div class="special-offer-information">
                    <div class="special-offer-name">
                        Game Console Controller + USB 3.0 Cable
                    </div>
                    <div class="special-offer-metter">
                        <div>
                            <span>Available: 6</span>
                        </div>
                        <div class="special-metter">
                            <div class="counter"></div>
                        </div>
                        <div class="special-offer-footer">
                            <p>Hurry Up! Offer ends in:</p>
                            <p class="end-special-offer">11 jan 2024</p>
                        </div>
                    </div>
            </div>
        </div>
    
        `
    }


    document.querySelector(".sale-items-container").innerHTML = ``;

    let productsSaleCartona = ``;
    
    if(products.length > 0) {

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
            productsSaleCartona +=
            `
            <div class="sale-item">
                <div class="sale-item-details">
                    <p class="sale-item-category">${product.Category}</p>
                    <h4 class="sale-item-name">
                        <a href="/ecommerce/productDetails/productDetails?id=${product.id}">${product.Name.substring(0 , 40)}...</a>
                    </h4>
                </div>
                <div class="sale-item-cover">
                    <img src="${product.Images[0].url}" alt="">
                </div>
                <div class="sale-item-price">
                    <span class="sale-item-price-badge">${product.Price}.00EPG</span>
                    <span class="sale-item-price-icon"><i class=" js-add-cart fa-solid fa-cart-plus" data-id="${product.id}"></i></span>
                </div>
            </div>
            
            `   
    
        });
    

    }

    document.querySelector(".sale-items-container").innerHTML = productsSaleCartona;


}

//handle Display by Category
const displayByCategory = () => {
    document.body.addEventListener("click" , (event) => {
        if(event.target.classList.contains("cardCategory") || event.target.classList.contains("js-category-img") ||event.target.classList.contains("js-category-heading")) {
            event.stopPropagation();
            let categoryName = event.target.dataset.name;
            localStorage.setItem("CategoryName" , categoryName);
            location.assign("/ecommerce/products/products");
        }
    })
}


//handle price after discount
const getPriceAfterDiscount = (productPrice , disValue) => {
    let discountValue = parseInt(disValue);
    let discountValuePercentage = (discountValue / 100);
    let discountValueAfterSale = (discountValuePercentage * productPrice);
    let currentPriceAfterDiscount = (productPrice - discountValueAfterSale);
    productPrice = currentPriceAfterDiscount;
    return productPrice;
}


const addToCart = () => {
    document.body.addEventListener("click" , async(event) => {
        if(event.target.classList.contains("js-add-cart")) {
            const productId = event.target.dataset.id;

            await addToCartHandle(productId);
        }
    })
}

const addToWishlist = () => {
    document.body.addEventListener("click" , async(event) => {
        if(event.target.classList.contains("js-add-wishlist")) {
            const productId = event.target.dataset.id;

            await addToWishlistHandle(productId);
        }
    })
}

homeHandle();