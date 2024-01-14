import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where  } from "firebase/firestore";
import { getFormData } from "../../../shared/extensions"
import { app, firestore } from "../../../../main";
import { authenticationValidation } from "../../../authentication/assets/js/authenticationModule";
import {createUserWithEmailAndPassword , getAuth, signInWithEmailAndPassword ,verifyBeforeUpdateEmail , updatePassword, signInWithCredential, signOut} from "firebase/auth";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

//constants
const authetication = getAuth(app);


//handle createUser
export const createUserHandle = async (form) => { //login user

    return new Promise(async(resolve , reject) => {

        const currentObject = getFormData(form);

        const validationResult = authenticationValidation(currentObject , "Register");

        if(validationResult.isValid){

            //change status of submit button and disabled it then show loading server

            document.getElementById("submitUserBtn").classList.add("disabled");

            document.getElementById("submitUserBtn").innerHTML =
            `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...

            `

            try{

                createUserWithEmailAndPassword(authetication , currentObject.Email , currentObject.Password)
                .then(async (credential) => { //return credential

                    delete currentObject.Password; //delete password before store in database

                    currentObject.ProfileImage = {imageUrl:"" , fullPath:""};

                    currentObject.Username = currentObject.Email.split("@")[0]; //get username from email

                    const documentReference = doc(firestore , "Users" , credential.user.uid);

                    try{
                        setDoc(documentReference , currentObject)
                        .then(async() => {
                            signInWithEmailAndPassword(authetication , "adminITI@gmail.com" , "omarhatab123456")
                            .then(() => {
                                resolve({done: true , err : ""});
                            })
                            .catch((error) => {
                                reject({done: false , err : error});
                            })
                            
                        })
                        
                    }
                    catch(error){
                        reject({done: false , err : error});
                    }


                })
                .catch((error) => {
                    reject({done: false , err: error});
                });
            }
            catch(error)
            {
                reject({done: false , err : error});
            }
        }
        else
        {
            reject({done: false , err: validationResult.messageError});
        }

    });

}

export const getAllUserOnlyTime = async() => {

    //get all user
    const collectionReference = collection(firestore , "Users");

    const w = where("Status", "==", true);
    const q = query(collectionReference , w);
    const result = await getDocs(q);

    const currentUsers = [];

    result.forEach((doc) => {
        currentUsers.push({id:doc.id , ...doc.data()});
    });

    return currentUsers;


}

//get all user to display it in datatable
export const getAllUser = () => {

    //get all user
    const collectionReference = collection(firestore , "Users");
    onSnapshot(collectionReference , (snapshot) => {


        const users = [];

        snapshot.docs.forEach((doc) => {

            users.push({id: doc.id , ...doc.data()});

        });


        generateUsersDatatable(users) //generate datatable


    });


}

const generateUsersDatatable = (users) => {

    document.getElementById("usersDataContainer").innerHTML = "";


    $(".datatables-users-basic").DataTable().clear().draw();


    users.forEach((user) => {

        $(".datatables-users-basic").DataTable().row.add(user).draw();

    });

}


//get single user by id
export const getSingleUserById = async(id) => {
    //get user
    const documentReference = doc(firestore , "Users" , id);

    try{

        const user = await getDoc(documentReference);

        const currentObject = {...user.data()};

        return currentObject;

    }
    catch(error)
    {
        console.log(error);
    }
}

//handle user update
export const updateUserHandle = (currentObject , id) => {

    return new Promise(async(resolve , reject) => {

        //get old user to access old data
        const oldUser = await getSingleUserById(id);
        const documentReference = doc(firestore , "Users" , id);

        try{

            if(currentObject.ProfileImage.name)//check if admin sending image
            {

                //delete old image
                if(oldUser.ProfileImage.imageUrl){ //check if admin was have old image delete it
                    deleteImage(oldUser.ProfileImage.fullPath);
                }
                currentObject.ProfileImage = await uploadImage(currentObject.ProfileImage);

            }
            else
            {
                currentObject.ProfileImage = oldUser.ProfileImage;
            }

            await updateDoc(documentReference , currentObject);

            resolve({done: true , err: ""});

        }
        catch(error)
        {
            reject({done: false , err: error});
        }


    });

}

//handle change Email
export const changeEmailHandle = (currentObject) => {

    return new Promise(async(resolve , reject) => {
        try{
            signInWithEmailAndPassword(authetication , authetication.currentUser.email , currentObject.CurrentPassword)
            .then(async(credential) => {

                verifyBeforeUpdateEmail(credential.user , currentObject.Email)
                .then(async() => {
                    resolve({done: true , err: ""});
                })
                .catch((error) => {
                    reject({done: false , err: error})
                })
                
            })
            .catch((error) => {
                reject({done: false , err: error});
            })

        }
        catch(error)
        {
            reject({done: false , err: error});
        }


    });

}

//handle change Password
export const changePasswordHandle = (currentObject) => {

    return new Promise(async(resolve , reject) => {
        try{
            signInWithEmailAndPassword(authetication , authetication.currentUser.email , currentObject.CurrentPassword)
            .then(async(credential) => {

                updatePassword(credential.user , currentObject.NewPassword)
                .then(() => {
                    resolve({done: true , err: ""});
                })
                .catch((error) => {
                    reject({done: false , err: error})
                })
                

            })
            .catch((error) => {
                reject({done: false , err: error});
            })

        }
        catch(error)
        {
            reject({done: false , err: error});
        }


    });

}

const uploadImage = (image) => {

    return new Promise((resolve , reject) => {


        const firebaseStoreage = getStorage(app);
        const storgeReference = ref(firebaseStoreage , `Users/${image.name}`);

        const metadata = {contentType : image.type};

        const uploadTask = uploadBytesResumable(storgeReference , image , metadata);
        uploadTask.then((snapshot) => {

            getDownloadURL(storgeReference).then((url) => {


                resolve({imageUrl: url , fullPath: snapshot.metadata.fullPath});


            })
            .catch((error) => {
                reject(error);
            })


        })
        .catch((error) => {
            reject(error);
        })





    });


}


export const deleteImage = (fullPath) => {
    const firebaseStorage = getStorage(app);
    const storgeReference = ref(firebaseStorage , fullPath);
    deleteObject(storgeReference).then(() => {console.log("image deleted")})
    .catch((err) => {console.log(err)})
}
