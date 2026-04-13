declare function describe(name: string, callback: () => void): void;
declare function it(name: string, callback: () => void): void;
declare function expect(value: unknown): {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};
