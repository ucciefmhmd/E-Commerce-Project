import { getSingleCustomerById } from "./customers";


let params = new URLSearchParams(location.search);
const id = params.get('id');


const detailsCustomerHandle = () => {
    displayCustomerDetails();
}


const displayCustomerDetails = async () => {

    const customer = await getSingleCustomerById(id);

    let historySalesCartona = "";

    //handle history Sales Table
    customer.HistorySales.forEach(salesItem => {
        

        historySalesCartona += `
        

        <tr>
            <td>
                <a href="/ecommerce/productDetails/productDetails?id=${salesItem.id}" title=${salesItem.Name}>${salesItem.Name.substring(0 , 30)}</a>
            </td>
            <td>${salesItem.Price}.00EPG</td>
            <td>
                <span class="item-number">${salesItem.quantityOrder}</span>
            </td>
            <td>
                <span class="sum-total">
                    ${salesItem.HasDiscount ? getPriceAfterDiscount(salesItem.Price , salesItem.DiscountVal) * parseInt(salesItem.quantityOrder) : parseInt(salesItem.Price) * parseInt(salesItem.quantityOrder)}.00EPG
                </span>
            </td>
        </tr>


        `



    });

    document.querySelector(".hsitorySales-container").innerHTML =  historySalesCartona;


}

//handle price after discount
const getPriceAfterDiscount = (productPrice , disValue) => {
    let discountValue = parseInt(disValue);
    let discountValuePercentage = (discountValue / 100);
    let discountValueAfterSale = (discountValuePercentage * productPrice);
    let currentPriceAfterDiscount = (productPrice - discountValueAfterSale);
    productPrice = currentPriceAfterDiscount;
    return productPrice;
}



detailsCustomerHandle();