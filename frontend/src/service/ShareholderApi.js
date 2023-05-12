import { baseQueryWithReauth } from "./ShareTypeApi";
import { createApi } from '@reduxjs/toolkit/query/react'

export const ShareholderApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath:"ShareholderReducer",
    tagTypes: ["Shareholder"],
    endpoints: (build) => ({
        getShareholder: build.query({
            query: () => '/shareholder/shareholder/',
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
              const { id, ...body } = data
              return {
                url: `shareholder/shareholder/${id}/`,
                method: 'PUT',
                body,
              }
            },

            invalidatesTags: (result, error, {id} ) => [{ type: 'Shareholder', id:"LIST" }],
          }),
}),
})

export const {
    useGetShareholderQuery,
    useUpdateShareholderMutation,
    useAddShareholderMutation,
} = ShareholderApi
