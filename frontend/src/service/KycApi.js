import { baseQueryWithReauth } from "./ShareTypeApi";
import { createApi } from '@reduxjs/toolkit/query/react'

export const KycApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath:"kycReducer",
    tagTypes: ["Kyc"],
    endpoints: (build) => ({
getKyc: build.query({
    query:(page = 0) => `/kyc/kyc/?page=${page+1}`,
    // transformResponse: (response, meta, arg) => response,
    providesTags: (result, error) => [{ type: 'Kyc', id:"LIST" }],
}),

getKycs: build.query({
    query: () => '/kyc/all',
    // transformResponse: (response, meta, arg) => response,
    providesTags: (result, error) => [{ type: 'Kyc', id:"LIST" }],
}),

getKycShareholder: build.query({
    query: () => '/kyc/kycShareholder/',
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
  })
}),
})

export const {
    useGetKycQuery,
    useGetKycsQuery,
    useAddKycMutation,
    useUpdateKycMutation,
    useCheckKycMutation,
    useGetKycShareholderQuery,

} = KycApi
