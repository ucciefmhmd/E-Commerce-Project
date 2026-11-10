
//imports
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import {getAllUserOnlyTime } from "../../../users/assets/js/users";
import { authenticationLogin } from "./authenticationModule";
import { app, firestore } from "../../../../main";
import { doc, setDoc } from "firebase/firestore";

// Admin account used by the admin panel. Read from environment variables (see .env.example).
// Note: anything bundled into browser JavaScript is visible to users; see README "Security notes".
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;


const authentication = getAuth(app);

const authenticationLoginHandle = () => {
    seedingAdmin();
    login();

};


const seedingAdmin = async() => {

    const Users = await getAllUserOnlyTime()

    let emailExisted = Users.some((user) => {
        return user.Email.toLowerCase() === ADMIN_EMAIL.toLocaleLowerCase();
    });

    if(!emailExisted){
        createUserWithEmailAndPassword(authentication , ADMIN_EMAIL , ADMIN_PASSWORD).then(async(credential) =>{

            const currentObject = new Object();

            currentObject.Username = "adminITI";
            currentObject.Email = ADMIN_EMAIL;
            currentObject.CreateAt = `${new Date()}`;
            currentObject.LastUpdatedAt = "";
            currentObject.ProfileImage = {imageUrl: "" , fullPath:""};
            currentObject.Status = true;
            currentObject.Role = "ADMIN";


            //add in firestore
            
            const documentReference = doc(firestore , "Users" , credential.user.uid);
            setDoc(documentReference , currentObject).then(() => {
                signOut(authentication);
            })

        });
    }

}


const login = () => {

    document.getElementById("loginBtn").addEventListener("click" , async (event) => {

        event.preventDefault();

        await authenticationLogin();

    });

}



//call authenticationLoginHandle.

authenticationLoginHandle();