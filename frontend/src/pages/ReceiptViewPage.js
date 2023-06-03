import { useEffect, useState } from "react";
import React from "react";
import { useGetSingleReceiptQuery } from "../service/LoanApi";
import { useParams } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

const ReceiptViewPage = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetSingleReceiptQuery(id);
    const [kyc, setKyc] = useState();
    useEffect(() => {
        setKyc(data && data);
        console.log(data);
    });
    return (
        <>
        <Meta title={`${id} Receipt Page`} />
            {isLoading ? (
                <div className="card">
                    <div className="border-round border-1 surface-border p-4">
                        <ul className="m-0 p-0 list-none">
                            <li className="mb-3">
                                <div className="flex">
                                    <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
                                    <div style={{ flex: "1" }}>
                                        <Skeleton width="100%" className="mb-2"></Skeleton>
                                        <Skeleton width="75%"></Skeleton>
                                    </div>
                                </div>
                            </li>
                            <li className="mb-3">
                                <div className="flex">
                                    <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
                                    <div style={{ flex: "1" }}>
                                        <Skeleton width="100%" className="mb-2"></Skeleton>
                                        <Skeleton width="75%"></Skeleton>
                                    </div>
                                </div>
                            </li>
                            <li className="mb-3">
                                <div className="flex">
                                    <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
                                    <div style={{ flex: "1" }}>
                                        <Skeleton width="100%" className="mb-2"></Skeleton>
                                        <Skeleton width="75%"></Skeleton>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex">
                                    <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
                                    <div style={{ flex: "1" }}>
                                        <Skeleton width="100%" className="mb-2"></Skeleton>
                                        <Skeleton width="75%"></Skeleton>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-row align-items-center justify-content-between">
                        <div className="card w-full md:w-15rem h-6rem">
                            <span className="w-full md:w-5rem block text-500 font-medium mb-2">Total Loan </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {kyc?.loan_count}
                            </span>
                            </div>
                            <div className="card w-full md:w-15rem h-6rem">
                            <span className="w-full md:w-7rem block text-500 font-medium mb-2">Total Deposit </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {kyc?.deposit_count}
                            </span>

                        </div>
                        <div className="card w-full md:w-15rem h-6rem">
                            <span className="w-full md:w-5rem block text-500 font-medium mb-2">Total Due </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {kyc?.due_count}
                            </span>

                        </div>

                    </div>
                    <div className="card mt-5">
                        <div className="flex justify-content-between">
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">ID :</span> <span style={{ color: "red" }}>{kyc?.slug}</span>
                                </h4>
                            </div>
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Pan : </span>
                                    <span style={{ color: "blue" }}>{kyc?.pan}</span>
                                </h4>
                            </div>
                        </div>
                        <div className="flex justify-content-between">
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Name : </span>
                                    <span style={{ color: "green" }}>{kyc?.first_name + " " + kyc?.last_name}</span>
                                </h4>
                            </div>
                            <div>

                            <h4>
                            <span className="w-full md:w-5rem">Mobile Number : </span>
                                    <span style={{ color: "brown" }}>{kyc?.mobile_number}</span>
                                    </h4>
                            </div>
                        </div>

                        <div className="flex justify-content-between">
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Email : </span>
                                    <span style={{ color: "green" }}>{kyc?.email ? kyc.email : <span style={{ color: "red" }}>Not provided</span>}</span>
                                </h4>
                            </div>
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Shareholder : </span>
                                    <span style={{ color: "green" }}>{kyc?.is_shareholder == true ? "Yes" : "No"}</span>
                                </h4>
                            </div>
                        </div>

                        <div className="flex justify-content-between">
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">State : </span>
                                    <span style={{ color: "green" }}>{kyc?.state}</span>
                                </h4>
                            </div>
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Status : </span>
                                    <span style={{ color: "red" }}>{kyc?.active == true ? "Active" : "InActive"}</span>
                                </h4>
                            </div>
                        </div>
                        <div className="flex justify-content-between">
                            <div>
                                <h4>
                                    <span className="w-full md:w-5rem">Residential Address : </span>
                                    <span style={{ color: "green" }}>{kyc?.address}</span>
                                </h4>
                            </div>

                        </div>
                        <div className="flex justify-content-between">
                            <div>
                                <h4>

                                </h4>
                            </div>
                            <div>
                                <h4></h4>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ReceiptViewPage;
