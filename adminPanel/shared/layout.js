import { onAuthStateChanged , getAuth , signOut} from "firebase/auth";
import { app } from "../../main";
import { doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { getSingleUserById } from "../users/assets/js/users";



//handle dashboard methods
const authentication = getAuth(app);
const firestore = getFirestore();

const layoutHandle = () => {

    //handle authentication logout.
    authenticationLogout();

    //check if user in authentication login.
    onAuthStateChanged(authentication , async(user) => {

        if(user){

            //handle loading
            document.querySelector(".overlay-loading").style.display = "none";

            //user
            const documentationReference = doc(firestore , "Users" , user.uid);

            //check user verification changed email
            const currentUser = getSingleUserById(user.uid);;
            if(currentUser.Email !== user.email){
                try{
                    await updateDoc(documentationReference , {Email: user.email});
                }
                catch(error)
                {
                    console.log(error);
                }
            }



            onSnapshot(documentationReference , (snapshot) => {

                const data = snapshot.data();

                document.querySelector(".dropdown").innerHTML = 
                `
                <a class="text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="profile-info d-flex justify-content-center align-items-center" style="z-index:1000000">
                        <div class="dropdown-info" style="padding:0px 20px; color: #000'">
                            <p class="dropdown-username" style="padding-bottom:0px; margin-bottom:0px">Hey, <b class="b">${data.Username}</b></p>
                            <small class="dropdown-role">${data.Role.toLowerCase()}</small>
                        </div>
                        <div class="profile-photo d-flex align-items-center">
                            <img width="40" height="40" src="${!data.ProfileImage.imageUrl ? '../dashboard/assets/images/avatar.png' : data.ProfileImage.imageUrl}">
                        </div>
                    </div>
                </a>
                <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/adminPanel/users/profile?id=${user.uid}">Profile</a></li>
                <li><a class="dropdown-item" href="/adminPanel/users/changeEmail?id=${user.uid}">Change Email</a></li>
                <li><a class="dropdown-item" href="/adminPanel/users/changePassword?id=${user.uid}">Change Password</a></li>
                <li><a class="dropdown-item logout-btn" href="javascript:;">Logout</a></li>
                </ul>

                `

                if(localStorage.getItem("mode")) {
                    if(localStorage.getItem("mode") === "dark")
                    {
                        document.querySelector(".dropdown-menu").classList.add("dropdown-menu-dark");                    
                    }
                    else
                    {
                        document.querySelector(".dropdown-menu").classList.remove("dropdown-menu-dark");                    
                    }
                }
            });


        }
        else
        {
            location.assign("/adminPanel/authentication/login");
        }
        
    });


}

document.body.addEventListener("click" , (event) => {

    if(event.target.classList.contains("dropdown-info") || event.target.classList.contains("dropdown-role") || event.target.classList.contains("dropdown-username") || event.target.classList.contains("b")){
        console.log("xxx")
        document.querySelector(".dropdown-menu").classList.toggle("active");
    }

});

const authenticationLogout = () => {

    document.addEventListener("click" , async (event) => {

        if(event.target.classList.contains("logout-btn")) {

            console.log("logout");

            try {

                await signOut(authentication);
                location.assign("http://localhost:5173/adminPanel/authentication/login");

            }
            catch(error) {

                console.log(error);

            }

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

