
//imports
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import {getAllUserOnlyTime } from "../../../users/assets/js/users";
import { authenticationLogin } from "./authenticationModule";
import { app } from "../../../../main";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const authentication = getAuth(app);
const firestore = getFirestore();

const authenticationLoginHandle = () => {
    seedingAdmin();
    login();

};


const seedingAdmin = async() => {

    const Users = await getAllUserOnlyTime()

    let emailExisted = Users.some((user) => {
        return user.Email.toLowerCase() === "adminITI@gmail.com".toLocaleLowerCase();
    });

    if(!emailExisted){
        createUserWithEmailAndPassword(authentication , "adminITI@gmail.com" , "omarhatab123456").then(async(credential) =>{

            const currentObject = new Object();

            currentObject.Username = "adminITI";
            currentObject.Email = "adminITI@gmail.com";
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