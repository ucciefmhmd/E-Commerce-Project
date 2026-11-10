// Product descriptions are rich text written in the admin panel's TinyMCE editor
// and stored as HTML, so they cannot simply be escaped. Sanitize them before
// they are assigned to innerHTML (strips <script>, event handlers, javascript: URLs...).
import DOMPurify from "dompurify";

export const sanitizeHtml = (html) => DOMPurify.sanitize(html == null ? "" : String(html));
