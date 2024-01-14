//imports
import moment from 'moment';
import { doc, onSnapshot} from 'firebase/firestore';
import { firestore } from '../../../../main';
import { getFormData } from '../../../shared/extensions';
import { authenticationValidation } from '../../../authentication/assets/js/authenticationModule';
import { changeEmailHandle } from './users';


let params = new URLSearchParams(location.search);
const id = params.get('id');


//constants
const changeEmailForm = document.getElementById("changeEmailForm");

const ChangeEmailHandle = () => {
    getCurrentUser();
    changeUserEmail();
}

//get user
const getCurrentUser = async() => {

    const documentationReference = doc(firestore , "Users" , id);

    onSnapshot(documentationReference , (snapshot) => {


        const user = snapshot.data()

        

        if(user.ProfileImage)
        {
            document.querySelector(".card-img img").src = (user.ProfileImage.imageUrl ? user.ProfileImage.imageUrl : "/images/avatar.png");
        }
        else
        {
            document.querySelector(".card-img img").src = "assets/images/avatar.png";
        }

        document.querySelector(".profile-username").textContent = user.Username;


        document.querySelector(".right-username").textContent = user.Username;
        document.querySelector(".right-email").textContent = user.Email;
        if(user.Phone){
            document.querySelector(".right-phone").textContent = user.Phone;
        }
        else
        {
            document.querySelector(".right-phone").textContent = "xxxxxxxxxxxx";
        }

        document.querySelector(".right-createdAt").textContent = moment(user.CreateAt).format('MMMM Do YYYY');
        
        if(user.LastUpdatedAt){
            document.querySelector(".right-lastUpdated").textContent = moment(user.LastUpdatedAt).format('MMMM Do YYYY');
        }
        else
        {
            document.querySelector(".right-lastUpdated").textContent = "no update yet";
        }

        document.querySelector(".right-role").textContent = user.Role;

        //form
        document.getElementById("newEmail").value = user.Email;


    });



}


const changeUserEmail = () => {

    document.getElementById("changeEmailBtn").addEventListener("click" , async (event) => {

        event.preventDefault();

        //get form data
        const currentObject = getFormData(changeEmailForm);
        console.log(currentObject);
        //validation 
        const validationResult = authenticationValidation(currentObject , "ChangeEmail");

        console.log(validationResult);

        if(validationResult.isValid)
        {

            document.getElementById("changeEmailBtn").classList.add("disabled");

            document.getElementById("changeEmailBtn").innerHTML = 
            `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...

            `

            console.log(currentObject);

            changeEmailHandle(currentObject).then((data) => {

                if(data.done)
                {

                    document.getElementById("changeEmailBtn").classList.remove("disabled");

                    document.getElementById("changeEmailBtn").innerHTML = 
                    `
                        Save changes
            
                    `

                    document.querySelector(".email-verification-alert").style.opacity = "1";
                    setTimeout(()=> {

                        document.querySelector(".email-verification-alert").style.opacity = "0";


                    } , 6000);

                    document.getElementById("changeEmailValidationSpan").textContent = "";
                    document.getElementById("currentPassword").value = "";

                }

            })
            .catch((data) => {

                document.getElementById("changeEmailBtn").classList.remove("disabled");

                document.getElementById("changeEmailBtn").innerHTML = 
                `
                    Save changes
        
                `

                let error = data.err.toString();

                if(error.includes("FirebaseError: Firebase: Error (auth/invalid-credential).")){
                    error = "password may be incorrect..!!";
                }

                document.getElementById("changeEmailValidationSpan").textContent = error;

            })


        }
        else
        {
            document.getElementById("changeEmailValidationSpan").textContent = validationResult.messageError;
        }

        // if(validationResult.isValid) {

        //     delete currentObject.CreateAt;
        //     currentObject.LastUpdatedAt = `${new Date()}`;

        //     document.getElementById("updateUserBtn").classList.add("disabled");

        //     document.getElementById("updateUserBtn").innerHTML = 
        //     `
        //         <div class="spinner-border text-light me-1" role="status" style="width:15px; height: 15px">
        //             <span class="visually-hidden">Loading...</span>
        //         </div>
        //         Looding..
    
        //     `

        //     //if data is valid send it
        //     updateUserHandle(currentObject , id)
        //     .then((data) => {

        //         if(data.done){

        //             document.getElementById("updateUserBtn").classList.remove("disabled");

        //             document.getElementById("updateUserBtn").innerHTML = 
        //             `
        //                 Save changes
            
        //             `

        //             document.getElementById("updateUserValidationSpan").textContent = "";

        //         }

        //         document.getElementById("profileCover").value = "";

        //     })
        //     .catch((data) => {

        //         document.getElementById("updateUserBtn").classList.remove("disabled");

        //         document.getElementById("updateUserBtn").innerHTML = 
        //         `
        //             Save changes
        
        //         `

        //         document.getElementById("updateUserValidationSpan").textContent = data.err;
        //     });
        // }
        // else
        // {
        //     document.getElementById("updateUserValidationSpan").textContent = validationResult.messageError;
        // }
    });

}


ChangeEmailHandle();