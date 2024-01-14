import { collection, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "../../../../main";
import { confirmationAlert } from "../../../shared/extensions";
import { deleteProduct, getSingleProductById } from "../../../products/assets/js/product";

const collectionReference = collection(firestore , "Orders");
//get all orders from firebase
export const getAllOrders = () => {

    //const productDocumentReference = doc(firestore , "Categories");

    onSnapshot(collectionReference , async(snapshot) => {

        const orders = [];

        snapshot.docs.forEach((doc) => {

            orders.push({id: doc.id , ...doc.data()});

        });

        //any request get all categories and clear dataTable and add each category to dataTable.

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

const prepareOrdersForDisplayIt = (orders) => {
    return new Promise((resolve , reject) => {

        let ordersP = [];
        let counter = 0;
        orders.forEach(async(order , index) => {
            getSingleCustomerById(order.userId)
            .then((customer) => {

                ordersP.push({orderId: order.id , totalPrice: order.totalPrice, shopping:order.shopping , nItems: order.shopping.length , customerId:order.userId , username: customer.Username , email: customer.Email , customer:customer})
                
                counter++;

                if(counter >= orders.length) {
                    resolve(ordersP);
                }

                

            })
    
            
        });


    });

}

//handle confirm orders
export const handleConfirmOrder = () => {
    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("js-confirm-order-btn")) {
            
            confirmationAlert("you will confirm this order now" , "confirm")
            .then(async(result) => {
                if(result.isConfirmed) {
                    
                    //get order by id 
                    const order = await getSingleOrderById(event.target.dataset.id);
                    order.shopping.forEach(async(product) => {
                        const currentProduct = await getSingleProductById(product.id);

                        //update numberOfPurchasing and Quantity
                        currentProduct.numberOfPurchasing = parseInt(currentProduct.numberOfPurchasing) + parseInt(product.quantityOrder);
                        currentProduct.Quantity = parseInt(currentProduct.Quantity) - parseInt(product.quantityOrder);
                        currentProduct.Rating = parseInt(currentProduct.Rating) + 1;
                       
                        if(parseInt(currentProduct.Quantity) <= 0) {
                            currentProduct.Status = false;
                        }

                        try{
                            const documentationReference = doc(firestore , "Products" , product.id);
                            updateDoc(documentationReference , currentProduct)
                            .then(async() => {
                                
                                console.log("Order Confirmed");

                            })
                        }
                        catch(error){
                            console.log(error);
                        };


                    });


                     //update history Sales
                     const customer = await getSingleCustomerById(event.target.dataset.customerid);
                     customer.HistorySales.push(...order.shopping);
                     const documentationCustomerReference = doc(firestore , `Customers` , event.target.dataset.customerid);
                     updateDoc(documentationCustomerReference , customer)
                     .then(async() => {

                        await deleteOrder(event.target.dataset.id);

                        
                            onSnapshot(collectionReference , async(snapshot) => {
        
                                const orders = [];
                        
                                snapshot.docs.forEach((doc) => {
                        
                                    orders.push({id: doc.id , ...doc.data()});
                        
                                });
                        
                                //any request get all categories and clear dataTable and add each category to dataTable.
                                if(orders.length <= 0) {
                                    generateOrdersDatatable([]);
                                }
                                    
                            });
    

                     })
                     .catch((error) => {
                         console.log(error);
                     });
                }
            });
        }
    })
}

//handle get single customer
const getSingleCustomerById = async(id) => {
    return new Promise((resolve , reject)=> {

        const documentationReference = doc(firestore , `Customers` , id);

        getDoc(documentationReference).then((userDocument) => {
            const currentObject = {...userDocument.data()};
            resolve(currentObject);
        })
    
    });

}

const getSingleOrderById = async(id) => {
    return new Promise((resolve , reject)=> {

        const documentationReference = doc(firestore , `Orders` , id);

        getDoc(documentationReference).then((orderDocument) => {
            const currentObject = {...orderDocument.data()};
            resolve(currentObject);
        })
    
    });

}

//delete product
export const deleteOrder = async (id) => {

    const documentationReference = doc(firestore , "Orders" , id);

    //delete product document

    try{
        await deleteDoc(documentationReference);
    }
    catch(error)
    {
        console.log(error);
    }


}

