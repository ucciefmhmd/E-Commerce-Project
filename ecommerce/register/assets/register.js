import { getFormData } from "../../../adminPanel/shared/extensions";
import {getFirestore , collection , addDoc, onSnapshot} from "firebase/firestore";
import {app} from "../../../main";


//Constants
const registerForm = document.getElementById("registerForm");
const username = document.getElementById("registerUsername");
const valName = document.getElementById("valUsername");
const email = document.getElementById("registerEmail");
const valEmail = document.getElementById("valEmail");
const password = document.getElementById("registerPassword");
const valPassword = document.getElementById("valPassword");

//firebase
const firestore = getFirestore(app);
const collectionCustomerReference = collection(firestore , "Customers");

//resit input
setTimeout(() => {
    username.value = "";
    email.value = "";
    password.value = "";
} , 500);

//handle validation Live
function validationLive(){
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let regexPassword = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    username.addEventListener("input" , () => {
        if(!username.value){
            valName.innerHTML = "username must be required..!!";
            username.classList.remove("valid");
            username.classList.add("invalid");
        }
        else
        {
            valName.innerHTML = "";
            username.classList.add("valid");
            username.classList.remove("invalid");
        }
    });

    email.addEventListener("input" , () => {

        if(!email.value){
            valEmail.innerHTML = "email must be required..!!";
            email.classList.remove("valid");
            email.classList.add("invalid");
        }
        else if(!regexEmail.test(email.value))
        {
            valEmail.innerHTML = "invalid email..!!";
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
        else if(!regexPassword.test(password.value))
        {
            valPassword.innerHTML = "password must be at least 6 characters or numbers..!!";
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

//this method validate register input and check if email in firebase using checkEmailDublicated method

function validationRegister(data) {
    const validationResult = new Object();
    validationResult.isValid = false;
    
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let regexPassword = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    let usernameValid = true;
    let emailValid = true;
    let passwordValid = true;

    if(!data.Username){
        valName.innerHTML = "username must be required..!!";
        usernameValid = false;
    }
    else {
        valName.innerHTML = "";
        usernameValid = true;
    }

    if(!data.Email){
        valEmail.innerHTML = "email must be required..!!";
        emailValid = false;
    }
    else if (!regexEmail.test(data.Email)) {
        valEmail.innerHTML = "invalid Email";
        emailValid = false;
    }
    else {
        valEmail.innerHTML = "";
        emailValid = true;
    }

    if(!data.Password){
        valPassword.innerHTML = "password must be required..!!";
        passwordValid = false;
    }
    else if (!regexPassword.test(data.Password)) {
        valPassword.innerHTML = "password must be at least 6 characters or numbers..!!";
        passwordValid = false;
    }
    else {
        valPassword.innerHTML = "";
        passwordValid = true;
    }

    if(emailValid && passwordValid && usernameValid) {
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
document.querySelector(".js-register-btn").addEventListener("click" , async(event) => {

    event.preventDefault();

    //get data from form
    const currentObject = getFormData(registerForm);
    currentObject.ProfileImage = [{url:"" , fullPath:""}];
    currentObject.HistorySales = [];
    currentObject.Role = "user";

    //validation
    const validationResult = validationRegister(currentObject);
    
    if(validationResult.isValid) {
        
        //check if email is already existed
        let isExisted = await checkEmailDublicated(currentObject.Email);

        if(isExisted) {
            //add user in firebase
            try{

                document.querySelector(".js-register-btn").innerHTML = 
                `
                <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
                Loading...

                `

                addDoc(collectionCustomerReference , currentObject)
                .then(() => {

                    document.getElementById("validationRegisterSpan").textContent = "";

                    document.querySelector(".js-register-btn").innerHTML = 
                    `
                    Register
        
                    `

                    location.assign("../login/login");
                })
                .catch((error) => {
                    document.getElementById("validationRegisterSpan").textContent = error;
                })

            }
            catch(error)
            {
                document.getElementById("validationRegisterSpan").innerHTML = error;
            }
        }
        else
        {
            valEmail.innerHTML = "Email is already existed..!!";
        }


    }
    else
    {
        console.log("invalid");
    }


});

//this method check if email is already found in firebase.
const checkEmailDublicated = (email) => {

    return new Promise((resolve , reject) => {

        //get all customers
        onSnapshot(collectionCustomerReference , (snapshot) => {

            const customers = [];

            snapshot.docs.forEach((doc) => {
                customers.push({id: doc.id , ...doc.data()});
            })

            if(customers.some((customer) => {return customer.Email == email})) {
                resolve(false);
            }
            else
            {
                resolve(true);
            }

        });
    });


}
