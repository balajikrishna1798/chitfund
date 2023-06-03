import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { authLogin } from "../service/Auth";
import { useNavigate } from "react-router-dom";

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }) => {
        const response = await authLogin(username, password );
        console.log(response)
        return {...response};
    }
);

const initialState = {
    "user": null,
    "role": "",
    "token": null,
    "isLoggedin": false,
    "error": false
}

const accountSlice = createSlice({

    name: "auth",
    initialState,
    reducers: {
        setCredentials:(state,action)=>{
            console.log(action);
            const {user,access_token} = action.payload
            state.user = user
            state.token = access_token
        },
        resetReducer: () => {
            return initialState
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                return state
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log(action,state);
                return {...state,...action.payload, isLoggedin: true,token:action.payload.access_token}
            })
            .addCase(login.rejected, (state, action) => {
                state = { ...state, error: true , isLoggedin: false}
                console.log(state)
                return state
            });
    },
});
export default accountSlice.reducer;
export const { resetReducer,setCredentials } = accountSlice.actions
