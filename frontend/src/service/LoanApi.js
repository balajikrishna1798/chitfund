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
            query:(data) => `/loan/loan/?page=${data.page+1}&search=${data.search}&loan_date_on_after=${data.searchLoanDateOn}&loan_date_on_before=${data.searchLoanDateTo}&maturity_term_after=${data.searchMaturityDateFrom}&maturity_date_before=${data.searchMaturityDateTo}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),

        getSingleLoan: build.query({
            // note: an optional `queryFn` may be used in place of `query`
            query: (id) => ({ url: `loan/loan/${id}` }),
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
            query:(data) => `/loan/due/?page=${data.page+1}&search=${data.search}&due_date_after=${data.searchDueDateOn}&due_date_before=${data.searchDueDateTo}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),


        getReceipt: build.query({
            query:(data) => `/loan/receipt/?page=${data.page+1}&search=${data.search}&created_at_after=${data.searchCreatedAtDateOn}&created_at_before=${data.searchCreatedAtDateTo}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Loan', id:"LIST" }],
        }),
        addReceipt: build.mutation({
            query: (body) => ({
                url: 'loan/receipt/',
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
    useGetSingleLoanQuery,
    useAddReceiptMutation,
    useGetReceiptQuery,
} = LoanApi
