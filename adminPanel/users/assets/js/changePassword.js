//imports
import moment from 'moment';
import { doc, onSnapshot} from 'firebase/firestore';
import { firestore } from '../../../../main';
import { getFormData } from '../../../shared/extensions';
import { authenticationValidation } from '../../../authentication/assets/js/authenticationModule';
import { changePasswordHandle } from './users';


let params = new URLSearchParams(location.search);
const id = params.get('id');


//constants
const changePasswordForm = document.getElementById("changePasswordForm");

const ChangePasswordHandle = () => {

    getCurrentUser();
    changeUserPassword();
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

        


    });



}


const changeUserPassword = () => {

    document.getElementById("changePasswordBtn").addEventListener("click" , async (event) => {

        event.preventDefault();

        //get form data
        const currentObject = getFormData(changePasswordForm);
        //validation 
        const validationResult = authenticationValidation(currentObject , "ChangePassword");

        console.log(validationResult);

        if(validationResult.isValid)
        {

            document.getElementById("changePasswordBtn").classList.add("disabled");

            document.getElementById("changePasswordBtn").innerHTML = 
            `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...
    
            `

            console.log(currentObject);

            changePasswordHandle(currentObject).then((data) => {

                if(data.done)
                {

                    document.getElementById("changePasswordBtn").classList.remove("disabled");

                    document.getElementById("changePasswordBtn").innerHTML = 
                    `
                        Save changes
            
                    `

                    document.querySelector(".password-verification-alert").style.opacity = "1";
                    setTimeout(()=> {

                        document.querySelector(".password-verification-alert").style.opacity = "0";


                    } , 6000);

                    document.getElementById("changePasswordValidationSpan").textContent = "";
                    document.getElementById("currentPassword").value = "";
                    document.getElementById("newPassword").value = "";
                }

            })
            .catch((data) => {

                document.getElementById("changePasswordBtn").classList.remove("disabled");

                document.getElementById("changePasswordBtn").innerHTML = 
                `
                    Save changes
        
                `

                let error = data.err.toString();

                if(error.includes("FirebaseError: Firebase: Error (auth/invalid-credential).")){
                    error = "password may be incorrect..!!";
                }

                document.getElementById("changePasswordValidationSpan").textContent = error;

            })


        }
        else
        {
            document.getElementById("changePasswordValidationSpan").textContent = validationResult.messageError;
        }

        
    });

}


ChangePasswordHandle();