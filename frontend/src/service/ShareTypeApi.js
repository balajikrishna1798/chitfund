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
export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
      if (result.error && result.error.status === 401) {
        // try to get a new token
        api.dispatch(resetReducer())
      }
    return result
}

export const ShareTypeApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Sharetype'],
    reducerPath:"ShareTypeApi",
    endpoints: (build) => ({
        getShareType: build.query({
            query:(data) => `/sharetype/sharetype/?page=${data.page+1}&share_type=${data.searchSharetype}&search=${data.search}`,
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Sharetype', id:"LIST" }],
        }),

        getShareTypes: build.query({
            query: () => '/sharetype/all/',
            // transformResponse: (response, meta, arg) => response,
            providesTags: (result, error) => [{ type: 'Sharetype', id:"LIST" }],
        }),

        addShareType: build.mutation({
            query: (body) => ({
                url: 'sharetype/sharetype/',
                credentials: 'include',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => [{ type: 'Sharetype' , id:"LIST" }],
        }),

        updateShareType: build.mutation({
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
          deleteShareType: build.mutation({
            query(id) {
              return {
                url: `sharetype/sharetype/${id}`,
                method: 'DELETE',
              }
            },
            // Invalidates all queries that subscribe to this Post `id` only.
            invalidatesTags: (result, error, id) => [{ type: 'Sharetype', id:"LIST" }],
        }),



    }),
})



export const {
    useGetShareTypesQuery,
    useGetShareTypeQuery,
    useAddShareTypeMutation,
    useUpdateShareTypeMutation,
    useDeleteShareTypeMutation,


} = ShareTypeApi

