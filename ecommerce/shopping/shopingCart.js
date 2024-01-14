import { addDoc, collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../../main";
import { increaseShoppingCartCounter } from "../../adminPanel/products/assets/js/product";


//constants
const firestore = getFirestore(app);
const collectionOrdersReference = collection(firestore , "Orders");
let shopping = [];



//handle wishlist
const shoppingHandle = () => {

    if(localStorage.getItem("ReturnUrl")) {
        localStorage.removeItem("ReturnUrl");
    }

    getAllProductsFromShopping();
    deleteFromShopping();
    counterControl();
}


//get all products from wishlist
const getAllProductsFromShopping = () => {
    if(localStorage.getItem("shoppingCart")) {
        shopping = JSON.parse(localStorage.getItem("shoppingCart"));
        setupShopping(shopping);
        totalPrice();
        checkoutBtnHandle();
    }

    
    
}


//setup wishlist in page
const setupShopping = (shopping) => {
    document.querySelector(".shoppingContainer").innerHTML = "";
    let shoppingProductCartona = "";
    shopping.forEach(product => {
        
        shoppingProductCartona += `
        
            <tr>
                <td>
                    <div class="product-details d-flex justify-content-start align-items-center" style="gap: 10px; padding:0px 30px ;">
                        <img src="${product.Images[0].url}" alt="" class="img-thumbnail" style="width: 50px; height: 50px; border-radius: 50%;">
                        <div class="product-info">
                            <a href="/ecommerce/productDetails/productDetails?id=${product.id}" class="product-name" title="${product.Name}">${product.Name.substring(0 , 50)}...</a>
                            <small class="product-category text-muted">${product.Category}</small>
                        </div>
                    </div>
                </td>
                <td>
                    ${product.HasDiscount ? ` <span style="text-decoration: line-through; color:#F00">${product.Price}.00 EPG</span> <span style="color:#080">${getPriceAfterDiscount(product.Price , product.DiscountVal)}.00EPG</span>` :`<span style="">${product.Price}.00 EPG</span>`}
                </td>
                <td>
                <div class="quantity-control d-flex justify-content-center align-items-center" >
                    <span class="quentity-increament d-flex justify-content-center align-items-center" data-id="${product.id}">
                        +
                    </span>
                    <span class="quantity-counter">
                        ${product.quantityOrder}
                    </span>
                    <span class="quentity-decreament d-flex justify-content-center align-items-center" data-id="${product.id}" >
                        -
                    </span>
                </div>
            </td>
                <td class="Actions">
                    <button class="btn btn-danger btn-sm js-delete-shopping" data-id="${product.id}">Delete</button>
                </td>
            </tr>
        
        `


    });

    document.querySelector(".shoppingContainer").innerHTML = shoppingProductCartona;
}


//handle delete from wichlist

const deleteFromShopping = () => {

    document.body.addEventListener("click" , (event) => {
        if(event.target.classList.contains("js-delete-shopping")) {

            const targetProductId = event.target.dataset.id;

            shopping.forEach((product , index) => {
                if(product.id == targetProductId) {
                    shopping.splice(index , 1);
                }
            });

            //update in localStorage
            localStorage.setItem("shoppingCart" , JSON.stringify(shopping));
            setupShopping(shopping);
            totalPrice();
            increaseShoppingCartCounter(shopping);
        }
    });


}

//handle total Price 
const totalPrice = () => {
    let total = 0;

    shopping.forEach((product) => {

        let productPrice = product.Price;

        if(product.HasDiscount){
            productPrice = getPriceAfterDiscount(product.Price , product.DiscountVal);
        }

        let productQO = product.quantityOrder;

        let totalForProduct = parseInt(productQO) * parseInt(productPrice);

        total += parseFloat(totalForProduct);

    });

    document.querySelector(".subtotal-span").innerHTML = total + ".00" + "EPG";
    return total;
}

//handle decreament and increament
const counterControl = () => {

    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("quentity-increament"))
        {

            let targetProductId = event.target.dataset.id;

            shopping.forEach(product => {
                if(product.id == targetProductId) {
                    if(product.quantityOrder >= product.Quantity) {
                        document.querySelector(".not-enough-alert").style.opacity = 1;
                        setTimeout(() => {
                            document.querySelector(".not-enough-alert").style.opacity = 0;
                        } , 2000)
                    }
                    else
                    {
                        product.quantityOrder = parseInt(product.quantityOrder) + 1;
                        localStorage.setItem("shoppingCart" , JSON.stringify(shopping));
                        setupShopping(shopping);
                        totalPrice();
                    }
                    
                }
            });

        }


        if(event.target.classList.contains("quentity-decreament"))
        {

            let targetProductId = event.target.dataset.id;

            shopping.forEach(product => {
                if(product.id == targetProductId) {
                    if(product.quantityOrder > 1) {
                        product.quantityOrder = parseInt(product.quantityOrder) - 1;
                        localStorage.setItem("shoppingCart" , JSON.stringify(shopping));
                        setupShopping(shopping);
                        totalPrice();
                    }
                }
            });

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


//handle checkout btn 
const checkoutBtnHandle = () => {
    document.querySelector(".checkout-btn").addEventListener("click" , () => {

        //get shopping cart from localStorage
        if(localStorage.getItem("shoppingCart") && shopping.length > 0) {

            //chcek if customer is login 
            if(localStorage.getItem("token") && localStorage.getItem("customerId"))
            {

                //add object of oreder
                const order = new Object();

                order.userId = localStorage.getItem("customerId");
                order.shopping = shopping;
                order.totalPrice = totalPrice();

                //change status of button 
                document.querySelector(".checkout-btn").innerHTML = 
                `
                <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
                Loading...
    
                `

                try{

                //save in firebase
                addDoc(collectionOrdersReference , order)
                .then(async() => {

                    shopping.length = 0;
                    setupShopping(shopping);
                    localStorage.removeItem("shoppingCart");
                    location.assign("/ecommerce/shopping/shoppingMessage");

                });

                }
                catch(error){
                    console.log(error);
                }   

            }
            else
            {
                localStorage.setItem("ReturnUrl" , "/ecommerce/shopping/shoppingCart");
                location.assign("/ecommerce/login/login");
            }
            
        }

    });

}




shoppingHandle();