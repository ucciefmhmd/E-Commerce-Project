import { onAuthStateChanged , getAuth } from "firebase/auth";
import { app, firestore } from "../../main";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getSingleUserById } from "../users/assets/js/users";
import { handleAdminDropdownToggle, handleAdminLogout, renderAdminDropdown } from "./adminNavbar";



//handle dashboard methods
const authentication = getAuth(app);

const layoutHandle = () => {

    //handle authentication logout.
    handleAdminLogout(authentication);
    handleAdminDropdownToggle();

    //check if user in authentication login.
    onAuthStateChanged(authentication , async(user) => {

        if(user){

            //handle loading
            document.querySelector(".overlay-loading").style.display = "none";

            //user
            const documentationReference = doc(firestore , "Users" , user.uid);

            //check user verification changed email
            //(getSingleUserById is async; without await this compared a Promise and wrote on every load)
            const currentUser = await getSingleUserById(user.uid);
            if(currentUser && currentUser.Email !== user.email){
                try{
                    await updateDoc(documentationReference , {Email: user.email});
                }
                catch(error)
                {
                    console.error(error);
                }
            }



            onSnapshot(documentationReference , (snapshot) => {
                renderAdminDropdown(snapshot.data() , user.uid);
            });


        }
        else
        {
            location.assign("/adminPanel/authentication/login");
        }

    });


}




const darkMode = document.querySelectorAll(".dark-mode span");


//check dark mode
if(localStorage.getItem("mode")) {
    if(localStorage.getItem("mode") === "dark")
    {
        document.body.classList.add("dark-mode-variables")
        darkMode.forEach((btn) => btn.classList.remove("active"));
        darkMode[1].classList.add("active");
        //
    }
}


//change mode color
darkMode.forEach((btn) => {
    btn.addEventListener("click" , function(){
        darkMode.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        if(this.dataset.mode === "light") {
            document.body.classList.remove("dark-mode-variables");
            document.querySelector(".dropdown-menu").classList.remove("dropdown-menu-dark");
            localStorage.setItem("mode" , "light");
        }
        else {
            document.body.classList.add("dark-mode-variables");
            document.querySelector(".dropdown-menu").classList.add("dropdown-menu-dark");
            localStorage.setItem("mode" , "dark");
        }
    });
});


layoutHandle();

