import { useEffect, useState } from "react";
import React from "react";
import { useGetSingleShareholderQuery } from "../service/ShareholderApi";
import { useParams, Link } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import Meta from "../components/Meta";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useGetLoansQuery } from "../service/LoanApi";
import { useGetDepositsQuery } from "../service/DepositApi";

import moment from "moment";
const ShareholderViewPage = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetSingleShareholderQuery(id);
    const { data: loan_data } = useGetLoansQuery(id);

    const { data: deposit_data } = useGetDepositsQuery(id);
    const [deposits, setDeposits] = useState();
    const [loans, setLoans] = useState();
    const [shareholder, setShareholder] = useState();
    useEffect(() => {
        setShareholder(data && data);
        console.log(data);
    }, [data]);

    useEffect(() => {
        setLoans(loan_data && loan_data);
        console.log(loan_data);
    }, [loan_data]);


    useEffect(() => {
        setDeposits(deposit_data && deposit_data);
        console.log(deposit_data);
    }, [deposit_data]);
    const getDues = (id) => {
        return loans && loans.find((a) => a.kyc_detail.id == id)?.due.filter((a) => a.active == true);
    };

    const getLoans = (id) => {
        console.log(loans && loans.filter((a) => a.kyc_detail.id == id).filter((a) => a.active == true),id);
        return loans && loans?.filter((a) => a.kyc_detail.id == id);
    };

    const getDeposits = (id) => {
        return deposits && deposits?.filter((a) => a.kyc_detail.id == id);
    };
    const getPayables = (id) => {
        return deposits && deposits.find((a) => a.kyc_detail.id == id)?.payable?.filter((a) => a.active == true);
    };
    const due_amount = (e) => {
        console.log(e, "s");
        return "₹" + Math.floor(e.due_amount);
    };

    const payable_amount = (e) => {
        console.log(e, "s");
        return "₹" + Math.floor(e.payable_amount);
    };
    const paid_amount = (e) => {
        console.log(e, "s");
        return "₹" + Math.floor(e.paid_amount);
    };
    const paid_payable_amount = (e) => {
        console.log(e, "s");
        return "₹" + Math.floor(e.paid_amount);
    };
    const loan_id = (e) => {
        console.log(e, "s");
        return "RSL" + e.loan;
    };
    const deposit_id = (e) => {
        console.log(e, "s");
        return "RSD" + e.deposit;
    };
    const Due_id = (e) => {
        console.log(e, "s");
        return e.id;
    };
    const Payable_id = (e) => {
        console.log(e, "s");
        return e.id;
    };
    const Due_date = (e) => {
        console.log(e, "s");
        return moment(e.due_date).format("DD MMMM yyyy, HH:mm:ss");
    };
    const Payable_date = (e) => {
        console.log(e, "s");
        return moment(e.payable_date).format("DD MMMM yyyy, HH:mm:ss");
    };
    const loan_kyc_id = (e) => {
        console.log(e,"sss");
        return e.amount
    }
    const loan_loan_id = (e) => {
        console.log(e,"sss");
        return e.id
    }
    const loan_interest_type = (e) =>{
return e.interest_type
    }
    const deposit_interest_type = (e) =>{
        return e.interest_type
            }

    return (
        <>
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
                    <Meta title={`${data?.kyc_detail.first_name} Shareholder Details`} />

                    {/*Header Card*/}
                    <div className="flex xl:flex-row md:flex-row sm:flex-row flex-column justify-content-between my-5" style={{ gap: "5px" }}>
                        <div className="card w-full md:w-20rem h-7rem">
                            <span className="w-full md:w-5rem block text-500 font-medium mb-2">Total Loan </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {shareholder?.loan_count}
                            </span>
                        </div>
                        <div className="card w-full md:w-20rem h-7rem">
                            <span className="w-full md:w-7rem block text-500 font-medium mb-2">Total Deposit </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {shareholder?.deposit_count}
                            </span>
                        </div>
                        <div className="card w-full md:w-20rem h-7rem">
                            <span className="w-full md:w-7rem block text-500 font-medium mb-2">Total Payable Amount </span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {shareholder?.total_payable_amount}
                            </span>
                        </div>

                        <div className="card w-full md:w-20rem h-7rem">
                            <span className="w-full md:w-5rem block text-500 font-medium mb-2">Total Due Amount</span>
                            <span className="text-900 font-medium text-xl" style={{ color: "green" }}>
                                {shareholder?.total_due_amount}
                            </span>
                        </div>
                    </div>

                    {/*Details Card*/}

                    <div className="flex xl:flex-row justify-content-between md:flex-column sm:flex-column flex-column" style={{gap:"3px"}}>

                        <div className="card xl:col-5 md:col-12 sm:col-12">
                            <h4>
                                <span className="w-full md:w-5rem">ID :</span> <span style={{ color: "red" }}>{shareholder?.slug}</span>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">Name : </span>
                                <span style={{ color: "green" }}>{shareholder?.kyc_detail?.first_name + " " + shareholder?.kyc_detail.last_name}</span>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">ShareType : </span>
                                <span style={{ color: "green" }}>{shareholder?.share_detail.share_type + "(" + shareholder?.share_detail.share_value.slice(0, -2) + ")"}</span>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">Number of shares : </span>
                                <span style={{ color: "brown" }}>{shareholder?.number_of_shares}</span>
                            </h4>

                            <h4>
                                <Link to={`/kyc/${shareholder?.kyc_detail.id}`}>
                                    <span className="w-full md:w-5rem">KYC ID : </span>
                                    <span style={{ color: "red" }}>{shareholder?.kyc_detail.slug}</span>
                                </Link>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">Starting Share : </span>
                                <span style={{ color: "green" }}>{shareholder?.starting_share}</span>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">Status : </span>
                                <span style={{ color: "red" }}>{shareholder?.active == true ? "Active" : "InActive"}</span>
                            </h4>

                            <h4>
                                <span className="w-full md:w-5rem">Ending Share : </span>
                                <span style={{ color: "green" }}>{shareholder?.ending_share}</span>
                            </h4>
                        </div>
                        <div className="flex flex-column xl:col-12">
                        <div className="card xl:col-7 col-12">
                        <h6>
                                <div className="w-full md:w-5rem mb-3" style={{color:"green"}}>Loans </div>
                                <DataTable paginator rows={2} value={getLoans(data.kyc)} tableStyle={{ width: "100%" }}>
                                <Column field="loan_id" header="Loan ID" body={loan_loan_id}></Column>
                                <Column field="amount" header="Amount" body={loan_kyc_id}></Column>
                                <Column field="interest_type" header="Interest Type" body={loan_interest_type}></Column>
                            </DataTable>
                            </h6>
                            </div>
                            <div className="card xl:col-7 col-12">
                        <h6>
                                <div className="w-full md:w-5rem mb-3" style={{color:"green"}}>Deposits </div>
                                <DataTable paginator rows={2} value={getDeposits(data.kyc)} tableStyle={{ width: "100%" }}>
                                <Column field="amount" header="Deposit ID" body={loan_loan_id}></Column>
                                <Column field="amount" header="Amount" body={loan_kyc_id}></Column>
                                <Column field="interest_type" header="Interest Type" body={deposit_interest_type}></Column>
                            </DataTable>
                            </h6>
                            </div>
                    </div>

                    </div>
                    <div style={{gap:"3px"}} className="flex xl:flex-row md:flex-column sm:flex-column flex-column justify-content-between">

                        <div className="card flex flex-row xl:col-6 md:col-12 col-12">
                        <h6> <div className="mb-3" style={{color:"brown"}}>Dues</div>
                            <DataTable value={getDues(data.kyc)} tableStyle={{ width: "100%" }}>

                                <Column field="loan_id" header="Loan ID" body={loan_id}></Column>
                                <Column field="due_id" header="Due ID" body={Due_id}></Column>

                                <Column header="Due amount" field="due_amount" body={due_amount}></Column>
                                <Column header="Paid amount" field="paid_amount" body={paid_amount}></Column>
                                <Column header="Due date" field="Due_date" body={Due_date}></Column>
                            </DataTable>
                            </h6>
                        </div>
                        <div className="card flex flex-row  xl:col-6 md:col-12 col-12">
                        <h6> <div className="mb-3" style={{color:"brown"}}>Payables</div>
                            <DataTable value={getPayables(data.kyc)} tableStyle={{ width: "100%" }}>
                                <Column field="loan_id" header="Deposit ID" body={deposit_id}></Column>
                                <Column field="due_id" header="Payable ID" body={Payable_id}></Column>
                                <Column header="Payable amount" field="payable_amount" body={payable_amount}></Column>
                                <Column header="Paid amount" field="paid_amount" body={paid_payable_amount}></Column>
                                <Column header="Due date" field="payable_date" body={Payable_date}></Column>
                            </DataTable>
                            </h6>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ShareholderViewPage;
