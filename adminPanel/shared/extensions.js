
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



