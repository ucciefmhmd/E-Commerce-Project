// Form validation shared by the admin panel and the storefront.
// Pure functions (no Firebase / DOM), unit-tested in tests/validation.test.js.

// No /g flag on these: a global regex keeps lastIndex between .test() calls,
// so the same valid input would alternately pass and fail.
const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i;
const regexPhone = /^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/;


//validate admin forms. status: "Register" | "Login" | "Update" | "ChangeEmail" | "ChangePassword"
export const authenticationValidation = (data , status) => {

    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.messageError = "";

    const emailValid = regexEmail.test(data.Email);

    const phoneValid = regexPhone.test(data.Phone);

    if(!data.Email && (status == "Register" || status == "Login")) {
        validationResult.messageError = "email must be required..!!";
    }
    else if(!emailValid && (status == "Register" || status == "Login" || status == "ChangeEmail")){
        validationResult.messageError = "invalid email..!!";
    }
    else if(!data.Username && status == "Update"){
        validationResult.messageError = "username must be required..!!";
    }
    else if(!phoneValid && status == "Update" && data.Phone){
        validationResult.messageError = "phone number invalid..!!";
    }
    else if(!data.Password && (status == "Register" || status == "Login")) {
        validationResult.messageError = "password must be required..!!";
    }
    else if(!data.CurrentPassword && status == "ChangeEmail") {
        validationResult.messageError = "Current Password must be required..!!";
    }
    else if(!data.CurrentPassword && status == "ChangePassword") {
        validationResult.messageError = "Current Password must be required..!!";
    }
    else if(!data.NewPassword && status == "ChangePassword") {
        validationResult.messageError = "New Password must be required..!!";
    }
    else if(!data.Role  && status == "Register"){
        validationResult.messageError = "Role must be required..!!";
    }
    else
    {
        validationResult.isValid = true;
        validationResult.messageError = "";
    }

    return validationResult

}


//validate the product review form on the storefront product page
export const reviewValidation = (data) => {

    const validationResult = new Object();
    validationResult.isValid = false;
    validationResult.messageError = "";

    const emailValid = regexEmail.test(data.Email);


    if(!data.Username){
        validationResult.messageError = "username must be required..!!";
    }
    else if(!data.Email) {
        validationResult.messageError = "email must be required..!!";
    }
    else if(!emailValid){
        validationResult.messageError = "invalid email..!!";
    }
    else if(data.Message == "Gave us your feedback about this product..." || !data.Message) {
        validationResult.messageError = "Message must be required..!!";
    }
    else
    {
        validationResult.isValid = true;
        validationResult.messageError = "";
    }

    return validationResult
}
