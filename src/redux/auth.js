import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    session: null,
    user: null,
    loading: true,
  },
  reducers: {
    setSession: (state, { payload }) => {
      return {
        ...state,
        session: payload,
        loading: false,
      };
    },
    setUser: (state, { payload }) => {
      return {
        ...state,
        user: payload,
      };
    },
    setUserProfilePicture: (state, { payload }) => {
      return {
        ...state,
        user: {
          ...state.user,
          profile_picture_url: payload,
        },
      };
    },
  },
});

export default authSlice.reducer;
export const { setSession, setUser, setUserProfilePicture } = authSlice.actions;
