import { baseQueryWithReauth } from "./ShareTypeApi";
import { createApi } from '@reduxjs/toolkit/query/react'

export const DepositApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath:"DepositReducer",
    tagTypes: ["Deposit"],
    endpoints: (build) => ({
        getDeposits: build.query({
            query: () => '/deposit/all/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Deposit', id:"LIST" }],
        }),

        getDeposit: build.query({
            query:(page = 0) => `/deposit/deposit/?page=${page+1}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Kyc', id:"LIST" }],
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
}),
})

export const {
    useGetDepositQuery,
    useGetDepositsQuery,
    useAddDepositMutation,
    useUpdateDepositMutation,
} = DepositApi
