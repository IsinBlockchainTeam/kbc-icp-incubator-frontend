import store, { RootState } from "../index";

describe("UNIT TEST: authSlice", () => {
  test("configures store", () => {
    expect(store).toBeDefined();
  });

  test("RootState has the correct initial state", () => {
    const initialState: RootState = store.getState();

    expect(initialState.auth.subjectDid).toBe("");
    expect(initialState.auth.subjectClaims).toBeNull();
  });
});
