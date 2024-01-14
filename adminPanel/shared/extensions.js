
import Swal from "sweetalert2";
//get data from any form



export const getFormData = (form) =>{


    const dataForm = new FormData(form);

        dataForm.append("CreateAt" , new Date());
        dataForm.append("LastUpdatedAt" , "");

        const dataFormArr = [...dataForm];

        const currentObject = new Object();

        currentObject.Status = true;

        dataFormArr.forEach((element) => {

            currentObject[element[0]] = element[1]

        });

        return currentObject;
}



export const confirmationAlert = (message , action) => {

    return new Promise((resolve , reject) => {


        Swal.fire({
            title: "Are you sure?",
            text: message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${action} it!`
        }).then((resolvedData) => {


            resolve(resolvedData);


        });


    })


}



    //method to calculate rating and know from it how many stars filled will rendered..
    export function calculateRating(value){
        if(!isNaN(parseInt(value))){ //if number
            let ratingValue = parseInt(value);
            if(ratingValue > 250)
            {
                ratingValue = 250;
            }

            let numberOfFillStars = (ratingValue / 50); 
            let numberOfFillStarsFloor = Math.floor(numberOfFillStars);

            return {numberOfFillStarsFloor , numberOfFillStars};
            
        }
        else
        {
            return {numberOfFillStarsFloor:0 , numberOfFillStars:0};   
        }
    }