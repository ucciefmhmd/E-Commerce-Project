// Firebase Storage helpers shared by products, categories and admin users.
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../../main";

const firebaseStorage = getStorage(app);

//upload one file to `${folder}/${file.name}` and resolve with {url, fullPath}
export const uploadFile = async (folder , file) => {
    const storageReference = ref(firebaseStorage , `${folder}/${file.name}`);
    const metadata = {contentType : file.type};

    const snapshot = await uploadBytesResumable(storageReference , file , metadata);
    const url = await getDownloadURL(storageReference);

    return {url: url , fullPath: snapshot.metadata.fullPath};
};

//upload several files to the same folder, keeping their order
export const uploadFiles = (folder , files) => {
    return Promise.all(files.map((file) => uploadFile(folder , file)));
};

//delete a stored file by its fullPath; failures are logged, not thrown (as before)
export const deleteFile = (fullPath) => {
    const storageReference = ref(firebaseStorage , fullPath);
    return deleteObject(storageReference).catch((err) => { console.error(err); });
};
