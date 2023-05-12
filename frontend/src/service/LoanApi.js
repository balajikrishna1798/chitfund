import { baseQueryWithReauth } from "./ShareTypeApi";
import { createApi } from '@reduxjs/toolkit/query/react'

export const LoanApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath:"LoanReducer",
    tagTypes: ["Loan"],
    endpoints: (build) => ({
        getLoans: build.query({
            query: () => '/loan/all/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),

        getLoan: build.query({
            query:(page = 0) => `/loan/loan/?page=${page+1}`,
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
        getDue: build.query({
            query: () => '/loan/due/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),

        getPayment: build.query({
            query: () => '/loan/payment/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),
        addPayment: build.mutation({
            query: (body) => ({
                url: 'loan/payment/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Loan' , id:"LIST" }],
        }),
}),
})

export const {
    useGetLoanQuery,
    useGetLoansQuery,
    useAddLoanMutation,
    useUpdateLoanMutation,
    useGetDueQuery,
    useAddPaymentMutation,
    useGetPaymentQuery,
} = LoanApi
