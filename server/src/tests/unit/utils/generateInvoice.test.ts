import { generateInvoice, type InvoiceOrderData } from "../../../utils/generateInvoice";

describe("PDF Invoice Generator Engine", () => {
  it("should generate a valid %PDF-1.4 binary buffer with appropriate trailer and xref structure", () => {
    const mockOrder: InvoiceOrderData = {
      id: "cm_test_order_123456789",
      totalAmount: 1250,
      status: "PAID",
      paymentStatus: "PAID",
      paymentMethod: "TELEBIRR",
      paymentReference: "TB-12345678",
      shippingName: "Almaz Ayana",
      shippingAddress: "Bole Sub-city, Woreda 03, House 402",
      shippingCity: "Addis Ababa",
      shippingCountry: "Ethiopia",
      createdAt: new Date("2026-10-18T10:00:00Z"),
      user: {
        name: "Almaz Ayana",
        email: "almaz@example.com",
        phone: "0911223344",
      },
      items: [
        {
          id: "item-1",
          quantity: 2,
          unitPrice: 500,
          product: { name: "Organic Ethiopian Honey 500g", slug: "ethiopian-honey" },
        },
        {
          id: "item-2",
          quantity: 1,
          unitPrice: 250,
          product: { name: "Yirgacheffe Ground Coffee 250g", slug: "yirgacheffe-coffee" },
        },
      ],
    };

    const pdfBuffer = generateInvoice(mockOrder);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    const pdfString = pdfBuffer.toString("utf8");

    // Header check
    expect(pdfString.startsWith("%PDF-1.4")).toBe(true);

    // Document structure checks
    expect(pdfString).toContain("/Type /Catalog");
    expect(pdfString).toContain("/Type /Pages");
    expect(pdfString).toContain("/Type /Page");
    expect(pdfString).toContain("/BaseFont /Helvetica");
    expect(pdfString).toContain("/BaseFont /Helvetica-Bold");

    // Content checks
    expect(pdfString).toContain("MEBA SUPERMARKET");
    expect(pdfString).toContain("INVOICE #INV-CM_TEST_");
    expect(pdfString).toContain("Almaz Ayana");
    expect(pdfString).toContain("Organic Ethiopian Honey 500g");
    expect(pdfString).toContain("Yirgacheffe Ground Coffee 250g");
    expect(pdfString).toContain("1,250.00 ETB");

    // Trailer and EOF checks
    expect(pdfString).toContain("xref");
    expect(pdfString).toContain("trailer");
    expect(pdfString.trim().endsWith("%%EOF")).toBe(true);
  });

  it("should handle empty or minimal order items safely", () => {
    const minimalOrder: InvoiceOrderData = {
      id: "cm_minimal_order",
      totalAmount: 0,
      items: [],
    };

    const pdfBuffer = generateInvoice(minimalOrder);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.toString("utf8").startsWith("%PDF-1.4")).toBe(true);
    expect(pdfBuffer.toString("utf8").trim().endsWith("%%EOF")).toBe(true);
  });
});
