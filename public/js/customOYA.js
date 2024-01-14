let fileInput = document.querySelector(".file-upload-input");
let fileSelect = document.querySelectorAll(".file-upload-select")[0];
fileSelect.onclick = function() {
	fileInput.click();
}
fileInput.addEventListener("change" , () => {
	let filename = fileInput.files[0].name;
	let selectName = document.getElementsByClassName("file-select-name")[0];
	selectName.innerText = filename;
});