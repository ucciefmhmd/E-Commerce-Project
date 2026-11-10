import { addToCartHandle } from "../../adminPanel/products/assets/js/product";
import {increaseFavCounter} from "../../adminPanel/products/assets/js/product";
import { escapeHtml, escapeUrl, renderPriceHtml } from "../../adminPanel/shared/helpers";
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

        const id = escapeHtml(product.id);

        wishlistProductCartona += `

            <tr>
                <td>
                    <div class="product-details d-flex justify-content-start align-items-center" style="gap: 10px; padding:0px 30px ;">
                        <img src="${escapeUrl(product.Images[0].url)}" alt="" class="img-thumbnail" style="width: 50px; height: 50px; border-radius: 50%;">
                        <div class="product-info">
                            <p class="product-name" title="${escapeHtml(product.Name)}">${escapeHtml(product.Name.substring(0 , 50))}...</p>
                            <small class="product-category text-muted">${escapeHtml(product.Category)}</small>
                        </div>
                    </div>
                </td>
                <td>
                    ${escapeHtml(product.Brand)}
                </td>
                <td>
                    ${renderPriceHtml(product)}
                </td>
                <td class="Actions">
                    <button class="btn btn-danger btn-sm js-delete-wishlist" data-id="${id}">Delete</button>
                    <button class="btn btn-success btn-sm js-add-cart-from-wishlist" data-id="${id}">Add To cart</button>
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





wishlistHandle();