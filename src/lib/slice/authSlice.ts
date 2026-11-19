import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Sign-up details kept between the sign-up form and the OTP page. The signed-in user
 * itself comes from the API (`useMeQuery`), since the session lives in an httpOnly cookie.
 */
export type authSliceType = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_seller: boolean;
};

const initialState: authSliceType = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  is_seller: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signUp(state, action: PayloadAction<authSliceType>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { signUp } = authSlice.actions;
export default authSlice.reducer;
