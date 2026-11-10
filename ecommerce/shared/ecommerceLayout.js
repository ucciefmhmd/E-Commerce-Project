
import { doc, onSnapshot} from "firebase/firestore";
import { firestore } from "../../main";
import { escapeHtml } from "../../adminPanel/shared/helpers";



//handle dashboard methods

const layoutHandle = () => {

    ecommerceLogout();

    if(localStorage.getItem("customerId")){
        const customerId = localStorage.getItem("customerId");
        const documentationReference = doc(firestore , "Customers" , customerId);

        onSnapshot(documentationReference , (snapshot) => {

            const data = {id:snapshot.id , ...snapshot.data()};
              document.querySelector(".dropdown").innerHTML = 
             `
                 <span class="span-username">Hello , ${escapeHtml(data.Username)}</span>
                 <h5 class="span-email">${escapeHtml(data.Email)}</h5>
                 <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/ecommerce/profile/profile?id=${encodeURIComponent(data.id)}">Profile</a></li>
                     <li><a class="dropdown-item js-logout-btn" href="javascript:;">Logout</a></li>
                 </ul>
    
             `
    
        });
    }
    else
    {
        document.querySelector(".dropdown").innerHTML = 
        `
            <span class="span-email">Hello , signin</span>
            <h5 class="span-email">Your Account</h5>
            <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/ecommerce/register/register">Register</a></li>
             <li><a class="dropdown-item" href="/ecommerce/login/login">Login</a></li>
         </ul>

        `
    }







}

document.body.addEventListener("click" , (event) => {

    if(event.target.classList.contains("span-username") || event.target.classList.contains("span-email")){
        document.querySelector(".dropdown-menu").classList.toggle("active");
    }

});

const ecommerceLogout = () => {

    document.addEventListener("click" , async (event) => {

        if(event.target.classList.contains("js-logout-btn")) {

            localStorage.removeItem("customerId");
            localStorage.removeItem("token");

            document.querySelector(".dropdown").innerHTML = 
            `
            <span class="span-email">Hello , signin</span>
            <h5 class="span-email">Your Account</h5>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/ecommerce/register/register">Register</a></li>
                <li><a class="dropdown-item" href="/ecommerce/login/login">Login</a></li>
             </ul>

    
            `

        }

    });

}





layoutHandle();

//handle badges counter (cart / wishlist item counts kept in localStorage)
const checkBadgesCounter = () => {

    const shoppingCartBadge = document.getElementById("cartBagBadge");
    if(localStorage.getItem("shoppingCart") && shoppingCartBadge){
        shoppingCartBadge.textContent = JSON.parse(localStorage.getItem("shoppingCart")).length;
    }

    const wishlistBadge = document.getElementById("favBadge");
    if(localStorage.getItem("wishlistCart") && wishlistBadge){
        wishlistBadge.textContent = JSON.parse(localStorage.getItem("wishlistCart")).length;
    }

}

checkBadgesCounter();

