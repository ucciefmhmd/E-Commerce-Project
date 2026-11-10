import { collection, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "../../../../main";
import { confirmationAlert } from "../../../shared/extensions";
import { getSingleProductById } from "../../../products/assets/js/product";

const collectionReference = collection(firestore , "Orders");
//get all orders from firebase
export const getAllOrders = () => {

    onSnapshot(collectionReference , async(snapshot) => {

        const orders = [];

        snapshot.docs.forEach((doc) => {

            orders.push({id: doc.id , ...doc.data()});

        });

        //any request get all orders and clear dataTable and add each order to dataTable.

        const prepareOrders = await prepareOrdersForDisplayIt(orders);

        generateOrdersDatatable(prepareOrders)

    });

}


const generateOrdersDatatable = async(orders) => {
    document.getElementById("oredersDataContainer").innerHTML = "";

    $(".datatables-orders-basic").DataTable().clear().draw();

    orders.forEach((order) => {
    $(".datatables-orders-basic").DataTable().row.add(order).draw();

    });
};

//resolves (also with zero orders, which previously left the promise pending
//and the table showing stale rows) once every order's customer is loaded
const prepareOrdersForDisplayIt = (orders) => {
    return Promise.all(orders.map(async(order) => {
        const customer = await getSingleCustomerById(order.userId);

        return {orderId: order.id , totalPrice: order.totalPrice, shopping:order.shopping , nItems: order.shopping.length , customerId:order.userId , username: customer.Username , email: customer.Email , customer:customer};
    }));
}

//handle confirm orders
export const handleConfirmOrder = () => {
    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("js-confirm-order-btn")) {

            const orderId = event.target.dataset.id;
            const customerId = event.target.dataset.customerid;

            confirmationAlert("you will confirm this order now" , "confirm")
            .then(async(result) => {
                if(result.isConfirmed) {

                    try {
                        //get order by id
                        const order = await getSingleOrderById(orderId);

                        //update every product of the order and wait for all of them
                        //before the order is deleted
                        await Promise.all(order.shopping.map(async(product) => {
                            const currentProduct = await getSingleProductById(product.id);

                            //update numberOfPurchasing and Quantity
                            currentProduct.numberOfPurchasing = parseInt(currentProduct.numberOfPurchasing) + parseInt(product.quantityOrder);
                            currentProduct.Quantity = parseInt(currentProduct.Quantity) - parseInt(product.quantityOrder);
                            currentProduct.Rating = parseInt(currentProduct.Rating) + 1;

                            if(parseInt(currentProduct.Quantity) <= 0) {
                                currentProduct.Status = false;
                            }

                            const documentationReference = doc(firestore , "Products" , product.id);
                            await updateDoc(documentationReference , currentProduct);
                        }));

                        //update history Sales
                        const customer = await getSingleCustomerById(customerId);
                        customer.HistorySales.push(...order.shopping);
                        const documentationCustomerReference = doc(firestore , `Customers` , customerId);
                        await updateDoc(documentationCustomerReference , customer);

                        //the orders listener in getAllOrders refreshes the table
                        await deleteOrder(orderId);
                    }
                    catch(error) {
                        console.error(error);
                    }
                }
            });
        }
    })
}

//handle get single customer
const getSingleCustomerById = async(id) => {
    const documentationReference = doc(firestore , `Customers` , id);
    const userDocument = await getDoc(documentationReference);
    return {...userDocument.data()};
}

const getSingleOrderById = async(id) => {
    const documentationReference = doc(firestore , `Orders` , id);
    const orderDocument = await getDoc(documentationReference);
    return {...orderDocument.data()};
}

//delete order
export const deleteOrder = async (id) => {

    const documentationReference = doc(firestore , "Orders" , id);

    try{
        await deleteDoc(documentationReference);
    }
    catch(error)
    {
        console.error(error);
    }


}

