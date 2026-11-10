import { getSingleCustomerById } from "./customers";
import { escapeHtml, getPriceAfterDiscount } from "../../../shared/helpers";


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

        const lineTotal = salesItem.HasDiscount ? getPriceAfterDiscount(salesItem.Price , salesItem.DiscountVal) * parseInt(salesItem.quantityOrder) : parseInt(salesItem.Price) * parseInt(salesItem.quantityOrder);

        historySalesCartona += `


        <tr>
            <td>
                <a href="/ecommerce/productDetails/productDetails?id=${encodeURIComponent(salesItem.id)}" title="${escapeHtml(salesItem.Name)}">${escapeHtml(salesItem.Name.substring(0 , 30))}</a>
            </td>
            <td>${escapeHtml(salesItem.Price)}.00EPG</td>
            <td>
                <span class="item-number">${escapeHtml(salesItem.quantityOrder)}</span>
            </td>
            <td>
                <span class="sum-total">
                    ${escapeHtml(lineTotal)}.00EPG
                </span>
            </td>
        </tr>


        `



    });

    document.querySelector(".hsitorySales-container").innerHTML =  historySalesCartona;


}



detailsCustomerHandle();
