// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const castToMock = <T extends (...args: any[]) => any>(mock: T) =>
  mock as unknown as jest.MockedFunction<T>
