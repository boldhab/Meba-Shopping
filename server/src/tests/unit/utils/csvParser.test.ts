import { parseCsv } from "../../../utils/csvParser";

describe("parseCsv", () => {
  it("should parse simple comma-separated values", () => {
    const csv = "name,price,stock\nApple,10,100\nBanana,5,200";
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["name", "price", "stock"],
      ["Apple", "10", "100"],
      ["Banana", "5", "200"],
    ]);
  });

  it("should handle commas inside quoted strings", () => {
    const csv = 'name,price,category\n"Organic Apple, Fuji",12,Fruits\n"Milk, Whole (1L)",25,Dairy';
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["name", "price", "category"],
      ["Organic Apple, Fuji", "12", "Fruits"],
      ["Milk, Whole (1L)", "25", "Dairy"],
    ]);
  });

  it('should handle escaped quotes ("") correctly', () => {
    const csv = 'name,description\nMonitor,"27"" 4K IPS Display"';
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["name", "description"],
      ["Monitor", '27" 4K IPS Display'],
    ]);
  });

  it("should handle CRLF and empty lines", () => {
    const csv = "col1,col2\r\nval1,val2\r\n\r\nval3,val4\r\n";
    const result = parseCsv(csv);
    expect(result).toEqual([
      ["col1", "col2"],
      ["val1", "val2"],
      ["val3", "val4"],
    ]);
  });
});
