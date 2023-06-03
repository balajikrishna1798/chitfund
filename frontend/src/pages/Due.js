import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useGetDueQuery } from "../service/LoanApi";
import { Calendar } from "primereact/calendar";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import { Skeleton } from "primereact/skeleton";
import Meta from "../components/Meta";

const Due = () => {
    const [dues, setDues] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [search, setSearch] = useState("");
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [formValue, setFormValue] = useState({
        searchDueDateFrom: "",
        searchDueDateTo: "",
    });
    const [fromDueDateSearch, setFromDueDateSearch] = useState("");
    const [toDueDateSearch, setToDueDateSearch] = useState("");
    const { data: getDue, isLoading } = useGetDueQuery({ page: lazyState.page, search: search, searchDueDateOn: formValue.searchDueDateFrom, searchDueDateTo: formValue.searchDueDateTo });

    useEffect(() => {
        console.log(getDue);
        setDues(getDue && getDue?.results);
    }, [getDue]);

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const shareholderBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.loan_detail.kyc_detail.first_name}-<span style={{ color: "green", fontWeight: "bold" }}>{rowData.loan_detail.kyc_detail.slug}</span>
            </>
        );
    };

    const loanBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.loan_detail.slug}-<span style={{ color: "red", fontWeight: "bold" }}>{rowData.loan_detail.interest_type}</span>
            </>
        );
    };

    const dueDateBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {new Date(rowData.due_date).toLocaleString()}
            </>
        );
    };

    const dueAmountBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Due Amount</span>
                {rowData.due_amount}
            </>
        );
    };

    const paidAmountBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Paid Amount</span>
                {rowData.paid_amount}
            </>
        );
    };
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Due</h5>
        </div>
    );

    const statusBodyTemplate = (product) => {
        return <Tag style={{ width: 50, height: 30 }} value={`${product.active === true ? "Active" : "InActive"}`} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        console.log(product);
        switch (product.active) {
            case true:
                return "success";

            case false:
                return "warning";

            default:
                return null;
        }
    };
    const onHandleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const onPage = (event) => {
        setlazyState(event);
    };
    const onSubmit = (event) => {
        event.preventDefault();
        setFormValue({
            searchDueDateFrom: fromDueDateSearch,
            searchDueDateTo: toDueDateSearch,
        });
    };
    const clearForm = () => {
        setFromDueDateSearch("");
        setToDueDateSearch("");

        setFormValue({
            searchDueDateFrom: "",
            searchDueDateTo: "",
        });
    };
    const handleDueDateSearch = (e) => {
        setFromDueDateSearch(e.target.value?.toLocaleDateString());
    };
    const handleDueToDateSearch = (e) => {
        setToDueDateSearch(e.target.value?.toLocaleDateString());
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    {/* <form onSubmit={onSubmit}>
                        <div className="card flex flex-row justify-content-between" style={{ background: "#e2c775" }}>
                            <div className="flex flex-column w-full md:w-13rem">
                                <InputText className="mt-4" value={search} id="first_name_search" type="text" name="first_name_search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                            </div>
                            <div className="flex flex-column w-full md:w-13rem">
                                <Calendar placeholder="Due Date from" value={fromDueDateSearch} className="mb-2" onChange={(e) => handleDueDateSearch(e)} />
                                <Calendar placeholder="Due Date to" value={toDueDateSearch} onChange={(e) => handleDueToDateSearch(e)} />
                            </div>
                            <div>
                                <Button type="submit" style={{ height: "2rem", display: "flex", justifyContent: "center" }} className="mt-3 w-full md:w-8rem">
                                    Submit
                                </Button>
                                <Button onClick={clearForm} style={{ height: "2rem", background: "red", display: "flex", justifyContent: "center" }} className="w-full md:w-8rem mt-2">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </form> */}

<form onSubmit={onSubmit}>

                        <div className="card grid justify-content-between" style={{ background: "linear-gradient(to right, #cac531, #f3f9a7)" }}>
                            <div className="col-12 md:col-3 xl:col-3">
                                <div className="flex mb-3">
                                    <div className="mt-4 xl:w-15rem sm:w-full w-full">
                                    <InputText className="w-full" value={search} id="first_name_search" type="text" name="first_name_search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 md:col-3 xl:col-3" style={{ gap: "4px" }}>
                            <Calendar placeholder="Due Date from" value={fromDueDateSearch} className="mb-2 w-full" onChange={(e) => handleDueDateSearch(e)} />
                                <Calendar placeholder="Due Date to" value={toDueDateSearch} className="w-full" onChange={(e) => handleDueToDateSearch(e)} />
                            </div>


                            <div className="col-12 md:col-2 xl:col-3 flex flex-column">
                                <div className="xl:ml-5">
                                <Button type="submit" style={{ height: "2rem", display: "flex", justifyContent: "center" }} className="mt-3 w-full md:w-8rem">
                                    Submit
                                </Button>
                                </div>
                                <div className="xl:ml-5">
                                <Button onClick={clearForm} style={{ height: "2rem", background: "red", display: "flex", justifyContent: "center" }} className="w-full md:w-8rem mt-2">
                                    Clear
                                </Button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>
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
                            <Meta title={"Dues"} />

                            <DataTable
                                ref={dt}
                                value={dues}
                                dataKey="id"
                                paginator
                                onPage={onPage}
                                rows={10}
                                scrollHeight="400px"
                                first={lazyState.first}
                                totalRecords={getDue?.count}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} dues"
                                emptyMessage="No dues are found."
                                header={header}
                                responsiveLayout="scroll"
                            >
                                <Column field="shareholder" header="Shareholder" body={shareholderBodyTemplate}></Column>
                                <Column field="loan" header="Loan" body={loanBodyTemplate}></Column>
                                <Column field="due_amount" header="Due Amount" body={dueAmountBodyTemplate}></Column>
                                <Column field="due_date" header="Paid Amount" body={paidAmountBodyTemplate}></Column>
                                <Column field="due_date" header="Due Date" body={dueDateBodyTemplate}></Column>
                                <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                                <Column field="status" header="Status" body={statusBodyTemplate}></Column>
                            </DataTable>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default React.memo(Due);
