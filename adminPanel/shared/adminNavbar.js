// Admin panel top-bar profile dropdown + logout, shared by the dashboard
// (dashboard.js) and every other admin page (layout.js).
import { signOut } from "firebase/auth";
import { escapeHtml, escapeUrl } from "./helpers";

const DEFAULT_AVATAR = "../dashboard/assets/images/avatar.png";

//render the profile dropdown from the signed-in user's Users document
export const renderAdminDropdown = (data , uid) => {

    const avatar = data.ProfileImage && data.ProfileImage.imageUrl ? escapeUrl(data.ProfileImage.imageUrl , DEFAULT_AVATAR) : DEFAULT_AVATAR;
    const id = encodeURIComponent(uid);

    document.querySelector(".dropdown").innerHTML =
    `
    <a class="text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <div class="profile-info d-flex justify-content-center align-items-center" style="z-index:1000000">
            <div class="dropdown-info" style="padding:0px 20px; color: #000'">
                <p class="dropdown-username" style="padding-bottom:0px; margin-bottom:0px">Hey, <b class="b">${escapeHtml(data.Username)}</b></p>
                <small class="dropdown-role">${escapeHtml(String(data.Role || "").toLowerCase())}</small>
            </div>
            <div class="profile-photo d-flex align-items-center">
                <img width="40" height="40" src="${avatar}">
            </div>
        </div>
    </a>
    <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="/adminPanel/users/profile?id=${id}">Profile</a></li>
    <li><a class="dropdown-item" href="/adminPanel/users/changeEmail?id=${id}">Change Email</a></li>
    <li><a class="dropdown-item" href="/adminPanel/users/changePassword?id=${id}">Change Password</a></li>
    <li><a class="dropdown-item logout-btn" href="javascript:;">Logout</a></li>
    </ul>
    `

    if(localStorage.getItem("mode")) {
        if(localStorage.getItem("mode") === "dark")
        {
            document.querySelector(".dropdown-menu").classList.add("dropdown-menu-dark");
        }
        else
        {
            document.querySelector(".dropdown-menu").classList.remove("dropdown-menu-dark");
        }
    }
};

//open/close the dropdown when the username/role is clicked
export const handleAdminDropdownToggle = () => {
    document.body.addEventListener("click" , (event) => {

        if(event.target.classList.contains("dropdown-info") || event.target.classList.contains("dropdown-role") || event.target.classList.contains("dropdown-username") || event.target.classList.contains("b")){
            document.querySelector(".dropdown-menu").classList.toggle("active");
        }

    });
};

//sign out and go to the admin login page when "Logout" is clicked
export const handleAdminLogout = (authentication) => {
    document.addEventListener("click" , async (event) => {

        if(event.target.classList.contains("logout-btn")) {

            try {
                await signOut(authentication);
                location.assign("/adminPanel/authentication/login");
            }
            catch(error) {
                console.error(error);
            }

        }

    });
};
