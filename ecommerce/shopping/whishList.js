import { addToCartHandle } from "../../adminPanel/products/assets/js/product";
import {increaseFavCounter} from "../../adminPanel/products/assets/js/product";
let wishlist = [];

//handle wishlist
const wishlistHandle = () => {
    getAllProductsFromWishlist();
    deleteFromWishlist();
    addToCartFromWishlist();
}


//get all products from wishlist
const getAllProductsFromWishlist = () => {
    if(localStorage.getItem("wishlistCart")) {
        wishlist = JSON.parse(localStorage.getItem("wishlistCart"));
        setupWishlist(wishlist);
    }
}


//setup wishlist in page
const setupWishlist = (wishlist) => {
    document.querySelector(".wishListContainer").innerHTML = "";
    let wishlistProductCartona = "";
    wishlist.forEach(product => {
        
        wishlistProductCartona += `
        
            <tr>
                <td>
                    <div class="product-details d-flex justify-content-start align-items-center" style="gap: 10px; padding:0px 30px ;">
                        <img src="${product.Images[0].url}" alt="" class="img-thumbnail" style="width: 50px; height: 50px; border-radius: 50%;">
                        <div class="product-info">
                            <p class="product-name" title="${product.Name}">${product.Name.substring(0 , 50)}...</p>
                            <small class="product-category text-muted">${product.Category}</small>
                        </div>
                    </div>
                </td>
                <td>
                    ${product.Brand}
                </td>
                <td>
                    ${product.HasDiscount ? ` <span style="text-decoration: line-through; color:#F00">${product.Price}.00 EPG</span> <span style="color:#080">${getPriceAfterDiscount(product.Price , product.DiscountVal)}.00EPG</span>` :`<span style="">${product.Price}.00 EPG</span>`}
                </td>
                <td class="Actions">
                    <button class="btn btn-danger btn-sm js-delete-wishlist" data-id="${product.id}">Delete</button>
                    <button class="btn btn-success btn-sm js-add-cart-from-wishlist" data-id="${product.id}">Add To cart</button>
                </td>
            </tr>
        
        `


    });

    document.querySelector(".wishListContainer").innerHTML = wishlistProductCartona;
}


//handle delete from wichlist

const deleteFromWishlist = () => {

    document.body.addEventListener("click" , (event) => {
        if(event.target.classList.contains("js-delete-wishlist")) {

            const targetProductId = event.target.dataset.id;

            wishlist.forEach((product , index) => {
                if(product.id == targetProductId) {
                    wishlist.splice(index , 1);
                }
            });

            //update in localStorage
            localStorage.setItem("wishlistCart" , JSON.stringify(wishlist));
            setupWishlist(wishlist);
            increaseFavCounter(wishlist);

        }
    });


}

//handle add to cart from wichlist

const addToCartFromWishlist = () => {

    document.body.addEventListener("click" , async(event) => {
        if(event.target.classList.contains("js-add-cart-from-wishlist")) {

            const targetProductId = event.target.dataset.id;

            await addToCartHandle(targetProductId);

            wishlist.forEach((product , index) => {
                if(product.id == targetProductId) {
                    wishlist.splice(index , 1);
                }
            });

            //update in localStorage
            localStorage.setItem("wishlistCart" , JSON.stringify(wishlist));
            setupWishlist(wishlist);
            increaseFavCounter(wishlist);

        }
    });


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




wishlistHandle();