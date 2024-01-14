import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { getFormData } from "../../../adminPanel/shared/extensions";
import { app } from "../../../main";


//Constants
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("loginEmail");
const valEmail = document.getElementById("valEmail");
const password = document.getElementById("loginPassword");
const valPassword = document.getElementById("valPassword");

//firebase
const firestore = getFirestore(app);
const collectionCustomerReference = collection(firestore , "Customers");

//check login authentication
if(localStorage.getItem("token") && localStorage.getItem("customerId"))
{
    location.assign("/")
}

//resit input
setTimeout(() => {
    email.value = "";
    password.value = "";
} , 500);

//handle validation Live
function validationLive(){
    email.addEventListener("input" , () => {

        if(!email.value){
            valEmail.innerHTML = "email must be required..!!";
            email.classList.remove("valid");
            email.classList.add("invalid");
        }
        else
        {
            valEmail.innerHTML = "";
            email.classList.add("valid");
            email.classList.remove("invalid");
        }
    });

    password.addEventListener("input" , () => {
        if(!password.value){
            valPassword.innerHTML = "password must be required..!!";
            password.classList.remove("valid");
            password.classList.add("invalid");
        }
        else
        {
            valPassword.innerHTML = "";
            password.classList.add("valid");
            password.classList.remove("invalid");
        }
    });


}

validationLive();


//this method validate login input and check if email in firebase using checkEmailAndPasswordConsistency method
function validationLogin() {
    const validationResult = new Object();
    validationResult.isValid = false;
    

    let emailValid = true;
    let passwordValid = true;

    if(!email.value){
        valEmail.innerHTML = "email must be required..!!";
        emailValid = false;
    }
    else {
        valEmail.innerHTML = "";
        emailValid = true;
    }

    if(!password.value){
        valPassword.innerHTML = "password must be required..!!";
        passwordValid = false;
    }
    else {
        valPassword.innerHTML = "";
        passwordValid = true;
    }

    if(emailValid && passwordValid) {
        validationResult.isValid = true
        return validationResult;
    }
    else
    {
        validationResult.isValid = false;
        return validationResult;
    }

    
}


//handle registeration 
document.querySelector(".js-login-btn").addEventListener("click" , async(event) => {

    event.preventDefault();

    //get data from form
    const currentObject = getFormData(loginForm);

    //validation
    const validationResult = validationLogin(currentObject);
    
    if(validationResult.isValid) {
        
        document.querySelector(".js-login-btn").innerHTML = 
        `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...

        `

        let isValidLogin = await checkEmailAndPasswordConsistency(currentObject.Email , currentObject.Password);
        
        if(isValidLogin.isValid)
        {
            document.getElementById("validationLoginSpan").innerHTML = "";
            
            document.querySelector(".js-login-btn").innerHTML = 
            `

                Login

            `
            //save token in localStorage
            localStorage.setItem("token" , `${currentObject.Email}1234567890000ABCDEFGabcLOGIN`);
            localStorage.setItem("customerId" , `${isValidLogin.id}`);

            if(localStorage.getItem("ReturnUrl")) {
                location.assign(localStorage.getItem("ReturnUrl"));
            }
            else
            {
                location.assign("/");
            }
            
        }
        else
        {
            document.getElementById("validationLoginSpan").innerHTML = "Email or Password may be incorrect..!!";
            document.querySelector(".js-login-btn").innerHTML = 
            `

                Login
            `
        }

    }
    else
    {
        console.log("invalid");
    }


});




//this method check if email is already found in firebase.
const checkEmailAndPasswordConsistency = (email , password) => {

    return new Promise((resolve , reject) => {

        //get all customers
        onSnapshot(collectionCustomerReference , (snapshot) => {

            const customers = [];

            snapshot.docs.forEach((doc) => {
                customers.push({id: doc.id , ...doc.data()});
            })

            if(customers.some((customer) => {return customer.Email == email && customer.Password == password})) {
                
                const currentCustomerArray = customers.filter((customer) => {return customer.Email == email && customer.Password == password});
                const currentCustomer = currentCustomerArray[0];

                resolve({isValid:true , id: currentCustomer.id});
            }
            else
            {
                resolve({isValid:false , id: ""});
            }

        });
    });


}


