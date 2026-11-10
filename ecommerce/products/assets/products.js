import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../main";
import { escapeHtml, escapeUrl, renderRatingStars } from "../../../adminPanel/shared/helpers";


//constants
const collectionReference = collection(firestore , "Products");

//handle products
const productsHandle = () => {
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelector(".overlay-loading").style.display = "none";
    });

    
    displayProducts();
}


const displayProducts = () => {
    if(localStorage.getItem("CategoryName")) {

        const category = localStorage.getItem("CategoryName");

        onSnapshot(collectionReference , (snapshot) => {


            const products = [];
    
            snapshot.docs.forEach((doc) => {
    
                products.push({id: doc.id , ...doc.data()});
    
            });

            const productsByCategory = products.filter((product) => {return product.Category == category && product.Status});

            setupAllProducts(productsByCategory);
            searchProduct(productsByCategory);
            filterByProduct(productsByCategory);

    
        });

    }
}


//setup products in home
const setupAllProducts = (products) => {

    document.querySelector(".products-container").innerHTML = ``;

    let productsCartona = ``;

    products.forEach((product) => {

        productsCartona +=
        `
        <div class="col-md-3">

            <div class="card-product">
                <div class="img"><img src="${escapeUrl(product.Images[0].url)}" alt="img" draggable="false" ></div>
                <div class="descOfProduct">
                    <p class="productCategory">${escapeHtml(product.Category)}</p>
                    <p class="productName">
                    <a href="/ecommerce/productDetails/productDetails?id=${encodeURIComponent(product.id)}" title="${escapeHtml(product.Name)}">${escapeHtml(product.Name.substring(0 , 60))}...</a>
                    </p>
                    <p class="rating">${renderRatingStars(product.Rating).html}</p>
                    <p class="productPrice">${escapeHtml(product.Price)}.00 EPG</p>
                </div>
            </div>

        </div>


        `

    });

    document.querySelector(".products-container").innerHTML = productsCartona;


}

//handle search product
const searchProduct = (products) => {
    document.querySelector(".js-product-search").addEventListener("keyup" , () => {

        const search = document.querySelector(".js-product-search");
        const brand = document.getElementById("productBrand");
        //check product Prand
        if(!brand.value)
        {
            const filterProducts = products.filter((product) => {return product.Name.toLowerCase().includes(search.value.toLowerCase())});
            setupAllProducts(filterProducts);
        }
        else
        {
            const filterProducts = products.filter((product) => {
                return product.Name.toLowerCase().includes(search.value.toLowerCase())  && (product.Brand.toLowerCase() == brand.value.toLowerCase());  
            });
            setupAllProducts(filterProducts);

        }

    });
}


//handle filter by brand product
const filterByProduct = (products) => {
    document.getElementById("productBrand").addEventListener("change" , () => {

        const search = document.querySelector(".js-product-search");
        const brand = document.getElementById("productBrand");
        //check product Prand
        if(!brand.value && !search.value){
            setupAllProducts(products);
        }
        else if(!brand.value && search.value) {
            const filterProducts = products.filter((product) => {return product.Name.toLowerCase().includes(search.value.toLowerCase())});
            setupAllProducts(filterProducts);
        }
        else if(brand.value && !search.value)
        {
            const filterProducts = products.filter((product) => {return product.Brand.toLowerCase() == brand.value.toLowerCase()});
            setupAllProducts(filterProducts);
        }
        else
        {
            const filterProducts = products.filter((product) => {
                return product.Name.toLowerCase().includes(search.value.toLowerCase())  && (product.Brand.toLowerCase() == brand.value.toLowerCase());  
            });
            setupAllProducts(filterProducts);

        }

    });
}


productsHandle();
