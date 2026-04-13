import { paginate } from "../../../utils/paginate";

describe("paginate", () => {
  it("returns a page slice", () => {
    expect(paginate([1, 2, 3], 1, 2)).toEqual([1, 2]);
  });
});
