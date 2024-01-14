import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../../main";



const collectionReference = collection(firestore , "Customers");


//get all categories from firebase
export const getCustomers = () => {


    onSnapshot(collectionReference , (snapshot) => {

        const customers = [];

        snapshot.docs.forEach((doc) => {

            customers.push({id: doc.id , ...doc.data()});

        });

        //any request get all customers and clear dataTable and add each customer to dataTable.

        generateCustomerDatatable(customers);

    });

}



const generateCustomerDatatable = (customers) => {

    console.log(customers);

     document.getElementById("customersDataContainer").innerHTML = "";


        $(".datatables-customer-basic").DataTable().clear().draw();

     customers.forEach((customer) => {
        
         $(".datatables-customer-basic").DataTable().row.add(customer).draw();
        
    });


}

export const getSingleCustomerById = async(id) => {
    const documentReference = doc(firestore , "Customers" , id);

    const customerDocument = await getDoc(documentReference);
    const currentObject = {...customerDocument.data()};
    return currentObject;
}