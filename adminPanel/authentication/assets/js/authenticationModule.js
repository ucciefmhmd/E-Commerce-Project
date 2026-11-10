import {getAuth , createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth";
import { getFormData } from "../../../shared/extensions";
import { authenticationValidation } from "../../../shared/validation";
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
            window.location.assign("/adminPanel/dashboard/home");
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
