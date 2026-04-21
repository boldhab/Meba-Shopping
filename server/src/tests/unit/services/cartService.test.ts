import {
  normalizeAddQuantity,
  normalizeUpdateQuantity,
  requireProductId,
} from "../../../services/cartService";

describe("cartService", () => {
  it("requires a product id", () => {
    let message = "";

    try {
      requireProductId("");
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe("productId is required.");
  });

  it("normalizes add quantities to whole numbers", () => {
    expect(normalizeAddQuantity(2.9)).toBe(2);
  });

  it("rejects add quantities below one", () => {
    let message = "";

    try {
      normalizeAddQuantity(0);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe("quantity must be at least 1.");
  });

  it("allows zero update quantities for removals", () => {
    expect(normalizeUpdateQuantity(0)).toBe(0);
  });

  it("rejects negative update quantities", () => {
    let message = "";

    try {
      normalizeUpdateQuantity(-1);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe("quantity must be 0 or greater.");
  });
});
