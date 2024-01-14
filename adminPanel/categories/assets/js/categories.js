import { getFormData } from "../../../shared/extensions"
import {collection , addDoc , onSnapshot , getDocs , getDoc , query , where, doc , updateDoc} from "firebase/firestore";
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { app, firestore} from "../../../../main";


const collectionReference = collection(firestore , "Categories");


//get all categories from firebase
export const getCategories = () => {

    //const productDocumentReference = doc(firestore , "Categories");

    onSnapshot(collectionReference , (snapshot) => {

        const categories = [];

        snapshot.docs.forEach((doc) => {

            categories.push({id: doc.id , ...doc.data()});

        });

        //any request get all categories and clear dataTable and add each category to dataTable.

        generateCategoryDatatable(categories);

    });

}



const generateCategoryDatatable = (categories) => {


    document.getElementById("categoriesDataContainer").innerHTML = "";


    $(".categories-datatables-basic").DataTable().clear().draw();

    categories.forEach((category) => {
        
        $(".categories-datatables-basic").DataTable().row.add(category).draw();
        
    });


}

//get all categories only one time
export const getAllCategories = async () => {
    const w = where("Status", "==", true);
    const q = query(collectionReference , w);
    const result = await getDocs(q);

    const currentCategories = [];

    result.forEach((doc) => {
        currentCategories.push({id:doc.id , ...doc.data()});
    });

    return currentCategories;
}

//get single category 
export const getSingleCategoriesById = async (id) => {

    const documentationReference = doc(firestore , "Categories" , id);

    const categoryDocument = await getDoc(documentationReference);

    const currentObject = {...categoryDocument.data()};

    return currentObject;
}


export const toggleStatusCategory = async (id) => {

    const documentationReference = doc(firestore , "Categories" , id);

    const currentObject = await getSingleCategoriesById(id);

    currentObject.LastUpdatedAt = `${new Date()}`;
    currentObject.Status = !currentObject.Status;

    //update category document

    try{
        await updateDoc(documentationReference ,currentObject);
        document.getElementById("categoryModal").classList.remove("show-modal");
    }
    catch(error)
    {
        console.log(error);
    }


}

//create new category to firebase
export const createCategory = async (form) => {

    return new Promise(async(resolve , reject) => {

    //get data from form
    const currentObject = getFormData(form);

    //validation Category
    const validationResult = validationCategory(currentObject , false);

    if(validationResult.isValid)
    {
        //change status of submit button and disabled it then show loading server

        document.getElementById("submitCategoryBtn").classList.add("disabled");

        document.getElementById("submitCategoryBtn").innerHTML = 
        `
        <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
        Loading...


        `
        
        try
        {
            //get url 
            currentObject.Image = [await uploadImage(currentObject.Image)]; //return url

            const docRef = await addDoc(collectionReference , currentObject);

            resolve({done:true , err : ""});

        }
        catch(error)
        {

            reject({done: false , err: error});

        }

    }
    else
    {

        document.getElementById("validationCategorySpan").textContent = validationResult.messageError;

    }

});


}



export const updateCategory = async (form , id) => {


    return new Promise(async(resolve , reject) => {

        const documentationReference = doc(firestore , "Categories" , id);

        const currentObject = await getSingleCategoriesById(id);

        currentObject.LastUpdatedAt = `${new Date()}`;
        currentObject.Name = form.Name.value;


        const validationResult = validationCategory(currentObject , true);
    
        if(validationResult.isValid)
        {
            //change status of submit button and disabled it then show loading server

            document.getElementById("submitCategoryBtn").classList.add("disabled");

            document.getElementById("submitCategoryBtn").innerHTML = 
            `
            <img src="/images/04-29-06-428_512.webp" style="margin-right: 10px;" alt="spinner" width="15">
            Loading...

            `

            try{

                //check if admin send new cover for category.
                if(form.Image.files.length > 0 ){

                    deleteImage(currentObject.Image[0].fullPath);

                    currentObject.Image = [await uploadImage(form.Image.files[0])];
                }


                await updateDoc(documentationReference ,currentObject);
                
                resolve({done:true , err : ""});
        
            }
            catch(error)
            {
                reject({done: false , err : error});
            }
        }
        else
        {
            document.getElementById("validationCategorySpan").textContent = validationResult.messageError;
        }
        //update category document

    });




    

    






}

//generate validation method
const validationCategory = (currentObject , updated) => {

    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.messageError = "";

    if(!currentObject.Name){
        validationResult.isValid = false;
        validationResult.messageError = "name field is required..!!";
    }
    else if(!updated)
    {
        if(!currentObject.Image.name){
            validationResult.isValid = false;
            validationResult.messageError = "image field is required..!!";
        }
        else
        {
            validationResult.isValid = true;
            validationResult.messageError = "";
        }

    }
    else
    {
        validationResult.isValid = true;
        validationResult.messageError = "";
    }

    return validationResult;

}

//return url
const uploadImage = (image) => {

    
    return new Promise((resolve , reject) => {

        const firebaseStorage = getStorage(app);
        const storgeReference = ref(firebaseStorage , `Categories/${image.name}`);
    
        const metadata = {contentType:image.type};
        const uploadTask = uploadBytesResumable(storgeReference , image , metadata);

        uploadTask.then((snapshot) => {
            getDownloadURL(storgeReference)
            .then((url) => {

                resolve({url: url , fullPath : snapshot.metadata.fullPath});

            })
            .catch((error) => {
                reject(error);
            });
        });

    });

}

export const deleteImage = (fullPath) => {
    const firebaseStorage = getStorage(app);
    const storgeReference = ref(firebaseStorage , fullPath);
    deleteObject(storgeReference).then(() => {console.log("image deleted")})
    .catch((err) => {console.log(err)})
}
