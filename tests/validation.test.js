import { describe, expect, it } from "vitest";
import { authenticationValidation, reviewValidation } from "../adminPanel/shared/validation.js";

describe("authenticationValidation", () => {
    const login = { Email: "admin@example.com", Password: "secret123" };

    it("accepts a valid login", () => {
        expect(authenticationValidation(login, "Login")).toEqual({ isValid: true, messageError: "" });
    });

    it("gives the same answer for the same input on repeated calls (regression: /g regex lastIndex)", () => {
        const results = Array.from({ length: 4 }, () => authenticationValidation(login, "Login").isValid);
        expect(results).toEqual([true, true, true, true]);

        const update = { Username: "admin", Phone: "01012345678" };
        const updates = Array.from({ length: 4 }, () => authenticationValidation(update, "Update").isValid);
        expect(updates).toEqual([true, true, true, true]);
    });

    it("requires email and password for Login and Register", () => {
        expect(authenticationValidation({ Password: "x" }, "Login").messageError).toBe("email must be required..!!");
        expect(authenticationValidation({ Email: "a@b.com" }, "Login").messageError).toBe("password must be required..!!");
        expect(authenticationValidation({ Email: "not-an-email", Password: "x" }, "Register").messageError).toBe("invalid email..!!");
    });

    it("requires a role for Register", () => {
        expect(authenticationValidation({ Email: "a@b.com", Password: "x" }, "Register").messageError).toBe("Role must be required..!!");
        expect(authenticationValidation({ Email: "a@b.com", Password: "x", Role: "ADMIN" }, "Register").isValid).toBe(true);
    });

    it("validates the profile update form", () => {
        expect(authenticationValidation({ Username: "" }, "Update").messageError).toBe("username must be required..!!");
        expect(authenticationValidation({ Username: "a", Phone: "12345" }, "Update").messageError).toBe("phone number invalid..!!");
        expect(authenticationValidation({ Username: "a", Phone: "" }, "Update").isValid).toBe(true);
        expect(authenticationValidation({ Username: "a", Phone: "+201112345678" }, "Update").isValid).toBe(true);
    });

    it("validates change email / change password forms", () => {
        expect(authenticationValidation({ Email: "a@b.com" }, "ChangeEmail").messageError).toBe("Current Password must be required..!!");
        expect(authenticationValidation({ Email: "a@b.com", CurrentPassword: "x" }, "ChangeEmail").isValid).toBe(true);
        expect(authenticationValidation({ NewPassword: "y" }, "ChangePassword").messageError).toBe("Current Password must be required..!!");
        expect(authenticationValidation({ CurrentPassword: "x" }, "ChangePassword").messageError).toBe("New Password must be required..!!");
        expect(authenticationValidation({ CurrentPassword: "x", NewPassword: "y" }, "ChangePassword").isValid).toBe(true);
    });

    it("accepts upper-case emails", () => {
        expect(authenticationValidation({ Email: "Admin@Example.COM", Password: "x" }, "Login").isValid).toBe(true);
    });
});

describe("reviewValidation", () => {
    const review = { Username: "Sara", Email: "sara@example.com", Message: "Great product" };

    it("accepts a complete review, repeatedly", () => {
        for (let i = 0; i < 3; i++) {
            expect(reviewValidation(review)).toEqual({ isValid: true, messageError: "" });
        }
    });

    it("requires username, a valid email and a message", () => {
        expect(reviewValidation({ ...review, Username: "" }).messageError).toBe("username must be required..!!");
        expect(reviewValidation({ ...review, Email: "" }).messageError).toBe("email must be required..!!");
        expect(reviewValidation({ ...review, Email: "nope" }).messageError).toBe("invalid email..!!");
        expect(reviewValidation({ ...review, Message: "" }).messageError).toBe("Message must be required..!!");
    });

    it("rejects the textarea placeholder text as a message", () => {
        expect(reviewValidation({ ...review, Message: "Gave us your feedback about this product..." }).isValid).toBe(false);
    });
});
