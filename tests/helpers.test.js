import { describe, expect, it } from "vitest";
import {
    calculateRating,
    escapeHtml,
    escapeUrl,
    getCartTotal,
    getPriceAfterDiscount,
    getUnitPrice,
    renderPriceHtml,
    renderRatingStars,
    safeUrl,
} from "../adminPanel/shared/helpers.js";

describe("escapeHtml", () => {
    it("escapes characters that are special in HTML text and attributes", () => {
        expect(escapeHtml(`<img src=x onerror="alert('x')">&\``)).toBe(
            "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;&#96;"
        );
    });

    it("returns an empty string for null and undefined", () => {
        expect(escapeHtml(null)).toBe("");
        expect(escapeHtml(undefined)).toBe("");
    });

    it("stringifies numbers and booleans", () => {
        expect(escapeHtml(250)).toBe("250");
        expect(escapeHtml(0)).toBe("0");
        expect(escapeHtml(false)).toBe("false");
    });

    it("leaves plain text unchanged", () => {
        expect(escapeHtml("Gaming Laptop 15.6”")).toBe("Gaming Laptop 15.6”");
    });
});

describe("safeUrl / escapeUrl", () => {
    it("allows http(s), blob, data:image and relative URLs", () => {
        const urls = [
            "https://firebasestorage.googleapis.com/v0/b/x/o/Products%2Fa.jpg?alt=media&token=1",
            "http://example.com/a.png",
            "blob:http://localhost:5173/1234",
            "data:image/png;base64,AAAA",
            "/images/avatar.png",
            "../dashboard/assets/images/avatar.png",
            "assets/images/avatar.png",
        ];
        for (const url of urls) expect(safeUrl(url)).toBe(url);
    });

    it("rejects script-capable schemes, including obfuscated ones", () => {
        for (const url of ["javascript:alert(1)", " JavaScript:alert(1)", "java\tscript:alert(1)", "vbscript:x", "data:text/html,<script>x</script>"]) {
            expect(safeUrl(url, "fallback.png")).toBe("fallback.png");
        }
    });

    it("returns the fallback for empty values", () => {
        expect(safeUrl("", "f")).toBe("f");
        expect(safeUrl(undefined, "f")).toBe("f");
        expect(safeUrl(null)).toBe("");
    });

    it("escapeUrl also HTML-escapes the result for use in a quoted attribute", () => {
        expect(escapeUrl('https://x.test/a.png?a=1&b="2"')).toBe("https://x.test/a.png?a=1&amp;b=&quot;2&quot;");
        expect(escapeUrl("javascript:alert(1)")).toBe("");
    });
});

describe("getPriceAfterDiscount", () => {
    it("applies a percentage discount", () => {
        expect(getPriceAfterDiscount(200, 25)).toBe(150);
        expect(getPriceAfterDiscount(100, 0)).toBe(100);
        expect(getPriceAfterDiscount(100, 100)).toBe(0);
    });

    it("accepts the string values stored by the forms", () => {
        expect(getPriceAfterDiscount("1000", "10")).toBe(900);
    });

    it("can return fractional prices", () => {
        expect(getPriceAfterDiscount(99, 50)).toBe(49.5);
    });
});

describe("cart totals", () => {
    const cart = [
        { Price: "100", HasDiscount: false, DiscountVal: 0, quantityOrder: 2 },
        { Price: "200", HasDiscount: true, DiscountVal: "25", quantityOrder: "3" },
        { Price: "99", HasDiscount: true, DiscountVal: 50, quantityOrder: 1 },
    ];

    it("getUnitPrice uses the discounted price only when HasDiscount is set", () => {
        expect(getUnitPrice(cart[0])).toBe("100");
        expect(getUnitPrice(cart[1])).toBe(150);
        expect(getUnitPrice({ Price: 80, HasDiscount: false, DiscountVal: 50 })).toBe(80);
    });

    it("getCartTotal sums quantity x unit price, truncating unit prices like the cart page always did", () => {
        // 2*100 + 3*150 + 1*parseInt(49.5)
        expect(getCartTotal(cart)).toBe(200 + 450 + 49);
    });

    it("is 0 for an empty cart", () => {
        expect(getCartTotal([])).toBe(0);
    });
});

describe("rating", () => {
    it("maps the stored running total to stars at 50 points per star", () => {
        expect(calculateRating(0)).toEqual({ numberOfFillStarsFloor: 0, numberOfFillStars: 0 });
        expect(calculateRating(75)).toEqual({ numberOfFillStarsFloor: 1, numberOfFillStars: 1.5 });
        expect(calculateRating("150")).toEqual({ numberOfFillStarsFloor: 3, numberOfFillStars: 3 });
    });

    it("caps at 5 stars", () => {
        expect(calculateRating(1000)).toEqual({ numberOfFillStarsFloor: 5, numberOfFillStars: 5 });
    });

    it("treats missing or non-numeric values as 0", () => {
        expect(calculateRating(undefined)).toEqual({ numberOfFillStarsFloor: 0, numberOfFillStars: 0 });
        expect(calculateRating("abc")).toEqual({ numberOfFillStarsFloor: 0, numberOfFillStars: 0 });
    });

    it("renderRatingStars renders 5 stars, filled first", () => {
        const { html, value } = renderRatingStars(120);
        expect(value).toBe(2.4);
        expect(html.match(/Filled_star\.png/g)).toHaveLength(2);
        expect(html.match(/empty_star\.png/g)).toHaveLength(3);
        expect(html.indexOf("empty_star")).toBeGreaterThan(html.lastIndexOf("Filled_star"));
    });
});

describe("renderPriceHtml", () => {
    it("shows old and discounted prices when discounted", () => {
        const html = renderPriceHtml({ Price: 200, HasDiscount: true, DiscountVal: 25 });
        expect(html).toContain("line-through");
        expect(html).toContain("200.00 EPG");
        expect(html).toContain("150.00EPG");
    });

    it("shows only the price otherwise, escaped", () => {
        expect(renderPriceHtml({ Price: "<b>9</b>", HasDiscount: false })).toBe('<span style="">&lt;b&gt;9&lt;/b&gt;.00 EPG</span>');
    });
});
