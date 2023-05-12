import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BASE_URL } from './Server';
import {resetReducer} from '../features/authSlice'

export const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL + "/",
    credentials:'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState()).auth.access_token

        console.log("token", token);
        // If we have a token set in state, let's assume that we should be passing it.
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
})
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
      if (result.error && result.error.status === 401) {
        // try to get a new token
        api.dispatch(resetReducer())
      }
    return result
}

export const api = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Sharetype','Kyc','Deposit','Loan',"Shareholder","Due","Payment"],
    endpoints: (build) => ({
        getShare: build.query({
            query:(page = 0) => `/sharetype/sharetype/?page=${page+1}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Sharetype', id:"LIST" }],
        }),
        addShare: build.mutation({
            query: (body) => ({
                url: 'sharetype/sharetype/',
                credentials: 'include',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Sharetype' , id:"LIST" }],
        }),


        updateShare: build.mutation({
            query(data) {
              const { id, ...body } = data
              return {
                url: `sharetype/sharetype/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Sharetype', id:"LIST" }],
          }),
          deleteShare: build.mutation({
            query(id) {
              return {
                url: `sharetype/sharetype/${id}`,
                method: 'DELETE',
              }
            },
            // Invalidates all queries that subscribe to this Post `id` only.
            invalidatesTags: (result, error, id) => [{ type: 'Sharetype', id:"LIST" }],
        }),

        getKyc: build.query({
            query:(page = 0) => `/kyc/kyc/?page=${page+1}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Kyc', id:"LIST" }],
        }),

        getKycs: build.query({
            query: () => '/kyc/kyc/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Kyc', id:"LIST" }],
        }),

        addKyc: build.mutation({
            query: (body) => ({
                url: 'kyc/kyc/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Kyc' , id:"LIST" }],
        }),

        checkKyc: build.mutation({
            query: (body) => ({
                url: 'kyc/validation/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Kyc' , id:"LIST" }],
        }),

        updateKyc: build.mutation({
            query(data) {
                console.log("asd",data);
              const { id, ...body } = data
              return {
                url: `kyc/kyc/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Kyc', id:"LIST" }],
          }),

        getDeposit: build.query({
            query: () => '/deposit/deposit/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Deposit', id:"LIST" }],
        }),

        addDeposit: build.mutation({
            query: (body) => ({
                url: 'deposit/deposit/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Deposit' , id:"LIST" }],
        }),
        updateDeposit: build.mutation({
            query(data) {
                console.log("asd",data);
              const { id, ...body } = data
              return {
                url: `deposit/deposit/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Deposit', id:"LIST" }],
          }),
          deleteDeposit: build.mutation({
            query(id) {
              return {
                url: `deposit/deposit/${id}`,
                method: 'DELETE',
              }
            },
            // Invalidates all queries that subscribe to this Post `id` only.
            invalidatesTags: (result, error, id) => [{ type: 'Deposit', id:"LIST" }],
        }),
        getLoan: build.query({
            query: () => '/loan/loan/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),

        addLoan: build.mutation({
            query: (body) => ({
                url: 'loan/loan/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Loan' , id:"LIST" }],
        }),
        updateLoan: build.mutation({
            query(data) {
                console.log("asd",data);
              const { id, ...body } = data
              return {
                url: `loan/loan/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Loan', id:"LIST" }],
          }),
          deleteLoan: build.mutation({
            query(id) {
              return {
                url: `loan/loan/${id}`,
                method: 'DELETE',
              }
            },
            // Invalidates all queries that subscribe to this Post `id` only.
            invalidatesTags: (result, error, id) => [{ type: 'Loan', id:"LIST" }],
        }),
        getShareholder: build.query({
            query: () => '/shareholder/shareholder/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Shareholder', id:"LIST" }],
        }),
        getKycShareholder: build.query({
            query: () => '/loan/kycShareholder/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Shareholder', id:"LIST" }],
        }),
        addShareholder: build.mutation({
            query: (body) => ({
                url: 'shareholder/shareholder/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Shareholder' , id:"LIST" }],
        }),

        updateShareholder: build.mutation({
            query(data) {
                console.log("asd",data);
              const { id, ...body } = data
              return {
                url: `shareholder/shareholder/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Shareholder', id:"LIST" }],
          }),
          getDue: build.query({
            query: () => '/loan/due/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Due', id:"LIST" }],
        }),

        getPayment: build.query({
            query: () => '/loan/payment/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Payment', id:"LIST" }],
        }),
        addPayment: build.mutation({
            query: (body) => ({
                url: 'loan/payment/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Payment' , id:"LIST" }],
        }),

    }),
})



export const {
    useGetShareQuery,
    useGetDueQuery,
    useGetDepositQuery,
    useGetLoanQuery,
    useAddShareMutation,
    useAddDepositMutation,
    useAddLoanMutation,
    useUpdateShareMutation,
    useDeleteDepositMutation,
    useGetKycShareholderQuery,
    useDeleteShareMutation,
    useGetKycQuery,
    useAddKycMutation,
    useAddPaymentMutation,
    useUpdateDepositMutation,
    useUpdateLoanMutation,
    useUpdateKycMutation,
    useDeleteLoanMutation,
    useCheckKycMutation,
    useGetPaymentQuery,
    useGetShareholderQuery,
    useUpdateShareholderMutation,
    useAddShareholderMutation,
} = api

