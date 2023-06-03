import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useGetPayableQuery } from "../service/DepositApi";
import { Calendar } from "primereact/calendar";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import { Skeleton } from "primereact/skeleton";
import Meta from "../components/Meta";

const Payable = () => {
    const [payables, setPayables] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [search, setSearch] = useState("");
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [formValue, setFormValue] = useState({
        searchPayableDateFrom: "",
        searchPayableDateTo: "",
    });
    const [fromPayableDateSearch, setFromPayableDateSearch] = useState("");
    const [toPayableDateSearch, setToPayableDateSearch] = useState("");
    const { data: getPayable } = useGetPayableQuery({ page: lazyState.page, search: search, searchPayableDateOn: formValue.searchPayableDateFrom, searchPayableDateTo: formValue.searchPayableDateTo });

    useEffect(() => {
        console.log(getPayable);
        setPayables(getPayable && getPayable?.results);
    }, [getPayable]);

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
                {rowData.deposit_detail.kyc_detail.first_name}-<span style={{ color: "green", fontWeight: "bold" }}>{rowData.deposit_detail.kyc_detail.slug}</span>
            </>
        );
    };

    const loanBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.deposit_detail.slug}-<span style={{ color: "red", fontWeight: "bold" }}>{rowData.deposit_detail.interest_type}</span>
            </>
        );
    };

    const payableDateBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {new Date(rowData.due_date).toLocaleString()}
            </>
        );
    };

    const payableAmountBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Payable Amount</span>
                {rowData.payable_amount}
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
            <h5 className="m-0">Payable</h5>
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
            searchPayableDateFrom: fromPayableDateSearch,
            searchPayableDateTo: toPayableDateSearch,
        });
    };
    const clearForm = () => {
        setFromPayableDateSearch("");
        setToPayableDateSearch("");

        setFormValue({
            searchPayableDateFrom: "",
            searchPayableDateTo: "",
        });
    };
    const handlePayableDateSearch = (e) => {
        setFromPayableDateSearch(e.target.value?.toLocaleDateString());
    };
    const handlePayableToDateSearch = (e) => {
        setToPayableDateSearch(e.target.value?.toLocaleDateString());
    };

    return (
        <div className="grid crud-demo">
            <Meta title={"Payables"} />
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    {/* <form onSubmit={onSubmit}>
                        <div className="card flex flex-row justify-content-between" style={{background:"#e2c775"}}>
                        <div className="flex flex-column w-full md:w-13rem">
                        <InputText className="mt-4" value={search} id="first_name_search" type="text" name="first_name_search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                        </div>
                            <div className="flex flex-column w-full md:w-13rem">
                                <Calendar placeholder="Payable Date from" value={fromPayableDateSearch} className="mb-2" onChange={(e) => handlePayableDateSearch(e)} />
                                <Calendar placeholder="Payable Date to" value={toPayableDateSearch} onChange={(e) => handlePayableToDateSearch(e)} />
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
                            <Calendar placeholder="Payable Date from" value={fromPayableDateSearch} className="mb-2 w-full" onChange={(e) => handlePayableDateSearch(e)} />
                                <Calendar placeholder="Payable Date to" value={toPayableDateSearch} className="w-full" onChange={(e) => handlePayableToDateSearch(e)} />
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
                    <DataTable
                        ref={dt}
                        value={payables}
                        dataKey="id"
                        paginator
                        onPage={onPage}
                        rows={10}
                        scrollHeight="400px"
                        first={lazyState.first}
                        totalRecords={getPayable?.count}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} payables"
                        emptyMessage="No payables are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="shareholder" header="Shareholder" body={shareholderBodyTemplate}></Column>
                        <Column field="deposit" header="Deposit" body={loanBodyTemplate}></Column>
                        <Column field="due_amount" header="Due Amount" body={payableAmountBodyTemplate}></Column>
                        <Column field="paid_amount" header="Paid Amount" body={paidAmountBodyTemplate}></Column>
                        <Column field="due_date" header="Due Date" body={payableDateBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
export default React.memo(Payable);
