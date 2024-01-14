
import { doc, getFirestore, onSnapshot} from "firebase/firestore";
import { app } from "../../main";



//handle dashboard methods
const firestore = getFirestore(app);

const layoutHandle = () => {

    ecommerceLogout();

    if(localStorage.getItem("customerId")){
        const customerId = localStorage.getItem("customerId");
        const documentationReference = doc(firestore , "Customers" , customerId);

        onSnapshot(documentationReference , (snapshot) => {

            const data = {id:snapshot.id , ...snapshot.data()};
              document.querySelector(".dropdown").innerHTML = 
             `
                 <span class="span-username">Hello , ${data.Username}</span>
                 <h5 class="span-email">${data.Email}</h5>
                 <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/ecommerce/profile/profile?id=${data.id}">Profile</a></li>
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

