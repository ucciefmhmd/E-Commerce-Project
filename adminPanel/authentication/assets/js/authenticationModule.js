import {getAuth , createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth";
import { getFormData } from "../../../shared/extensions";
import { app } from "../../../../main";


//constants

const loginForm = document.getElementById("loginForm");

const authetication = getAuth(app);


//handle authenticationLogin

export const authenticationLogin = async () => { //login user


    const currentObject = getFormData(loginForm);

    const validationResult = authenticationValidation(currentObject , "Login");

    if(validationResult.isValid){

        try{
            const credential = await signInWithEmailAndPassword(authetication , currentObject.Email , currentObject.Password);
            localStorage.setItem("credential" , JSON.stringify(credential));
            window.location.assign("http://localhost:5173/adminPanel/dashboard/home");
        }
        catch(error)
        {
            error = error.toString();
            if(error.includes("FirebaseError: Firebase: Error (auth/missing-email)"))
            {
                error = "email or password may be incorrect..!";
            }
            else if(error.includes("FirebaseError: Firebase: Error (auth/invalid-credential)."))
            {
                error = "email or password may be incorrect..!";
            }
            else if(error.includes("FirebaseError: Firebase: Error (auth/invalid-email)."))
            {
                error = "invalid email..!!";
            }
            document.getElementById("errorSpan").textContent = error;
        }

    }
    else
    {
        document.getElementById("errorSpan").textContent = validationResult.messageError
    }
}


export const authenticationValidation = (data , status) => {

    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.messageError = "";

    const regexEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi);
    const emailValid = regexEmail.test(data.Email);

    const regexPhone = new RegExp(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/g);
    const phoneValid = regexPhone.test(data.Phone);

    if(!data.Email && (status == "Register" || status == "Login")) {
        validationResult.messageError = "email must be required..!!";
    }
    else if(!emailValid && (status == "Register" || status == "Login" || status == "ChangeEmail")){
        validationResult.messageError = "invalid email..!!";
    }
    else if(!data.Username && status == "Update"){
        validationResult.messageError = "username must be required..!!";
    }
    else if(!phoneValid && status == "Update" && data.Phone){
        validationResult.messageError = "phone number invalid..!!";
    }
    else if(!data.Password && (status == "Register" || status == "Login")) {
        validationResult.messageError = "password must be required..!!";
    }
    else if(!data.CurrentPassword && status == "ChangeEmail") {
        validationResult.messageError = "Current Password must be required..!!";
    }
    else if(!data.CurrentPassword && status == "ChangePassword") {
        validationResult.messageError = "Current Password must be required..!!";
    }
    else if(!data.NewPassword && status == "ChangePassword") {
        validationResult.messageError = "New Password must be required..!!";
    }
    else if(!data.Role  && status == "Register"){
        validationResult.messageError = "Role must be required..!!";
    }
    else
    {
        validationResult.isValid = true;
        validationResult.messageError = "";
    }

    return validationResult


}





