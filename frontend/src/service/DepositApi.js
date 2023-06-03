import { baseQueryWithReauth } from "./ShareTypeApi";
import { createApi } from '@reduxjs/toolkit/query/react'

export const DepositApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath:"DepositReducer",
    tagTypes: ["Deposit","Payment"],
    endpoints: (build) => ({
        getDeposits: build.query({
            query: () => '/deposit/all/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Deposit', id:"LIST" }],
        }),

        getDeposit: build.query({
            query:(data) => `/deposit/deposit/?page=${data.page+1}&search=${data.search}&deposited_on_after=${data.searchDepositDateOn}&deposited_on_before=${data.searchDepositDateTo}&maturity_term_after=${data.searchMaturityDateFrom}&maturity_date_before=${data.searchMaturityDateTo}`,
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
        getPayment: build.query({
          query:(data) => `/deposit/payment/?page=${data.page+1}&search=${data.search}&created_at_after=${data.searchCreatedAtDateOn}&created_at_before=${data.searchCreatedAtDateTo}`,
          // transformResponse: (response, meta, arg) => response,
          providesTags: (result, error) => [{ type: 'Payment', id:"LIST" }],
      }),
      addPayment: build.mutation({
          query: (body) => ({
              url: 'deposit/payment/',
              method: 'POST',
              body,
          }),
          invalidatesTags: (result, error) => [{ type: 'Payment' , id:"LIST" }],
      }),
        getPayable: build.query({
            query:(data) => `/deposit/payable/?page=${data.page+1}&search=${data.search}&due_date_after=${data.searchPayableDateOn}&due_date_before=${data.searchPayableDateTo}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Deposit', id:"LIST" }],
        }),
}),
})

export const {
    useGetDepositQuery,
    useGetDepositsQuery,
    useAddPaymentMutation,
    useGetPaymentQuery,
    useGetPayableQuery,
    useAddDepositMutation,
    useUpdateDepositMutation,
} = DepositApi
