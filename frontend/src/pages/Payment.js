import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useAddPaymentMutation, useGetPaymentQuery } from "../service/DepositApi";
import { useGetDepositsQuery } from "../service/DepositApi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Tag } from "primereact/tag";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import { Calendar } from "primereact/calendar";
import Meta from "../components/Meta";
import { InputNumber } from "primereact/inputnumber";

const Payment = () => {
    const [addPayment] = useAddPaymentMutation();
    const [payments, setPayments] = useState(null);
    const [loanDialog, setLoanDialog] = useState(false);
    const [deposits, setDeposits] = useState(null);
    const [search, setSearch] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [formValue, setFormValue] = useState({
        searchCreatedAtDateFrom: "",
        searchCreatedAtDateTo: "",
    });
    const [fromCreatedAtSearch, setFromCreatedAtSearch] = useState("");
    const [toCreatedAtSearch, setToCreatedAtSearch] = useState("");
    const { data: deposit } = useGetDepositsQuery();
    const { data: payment } = useGetPaymentQuery({ page: lazyState?.page, search: search, searchCreatedAtDateOn: formValue.searchCreatedAtDateFrom, searchCreatedAtDateTo: formValue.searchCreatedAtDateTo });
    const onPage = (event) => {
        setlazyState(event);
    };

    useEffect(() => {
        setDeposits(deposit);
        console.log(deposit);
    }, [deposit]);

    useEffect(() => {
        setPayments(payment?.results);
    }, [payment]);

    const paymentTypeSchema = Yup.object().shape({
        deposit: Yup.string().required("This field is required"),
        amount: Yup.number()
            .required("This field is required")
            .moreThan(0)
            .test("maxDigitsAfterDecimal", "number field must have 4 digits after decimal or less", (number) => /^\d+(\.\d{1,4})?$/.test(number)),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            amount: null,
            deposit: null,
        },
        validationSchema: paymentTypeSchema,
        onSubmit: async (values) => {
            const { amount, deposit } = values;

            let _payments = [...payments];

            await addPayment({ amount, deposit })
                .unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Payment Created", life: 3000 }))
                .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Server Error", life: 3000 }));

            setPayments(_payments);
            setLoanDialog(false);
        },
    });

    const openNew = () => {
        formik.resetForm();
        setLoanDialog(true);
    };

    const hideDialog = () => {
        setLoanDialog(false);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    // const codeBodyTemplate = (rowData) => {
    //     console.log(rowData);
    //     return (
    //         <>
    //             <span className="p-column-title">Share Value</span>
    //             {rowData.shareholder_detail.kyc_detail.first_name} ({rowData.shareholder_detail.kyc_detail.pan})
    //         </>
    //     );
    // };

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.amount}
            </>
        );
    };

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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Payments</h5>
        </div>
    );

    const PaymentDialogFooter = () => (
        <p className="p-dialog-footer mb-0">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );

    const loanOptionTemplate = (option) => {
        console.log("ppppp", option);
        return (
            <div className="flex align-items-center">
                <div> {option.kyc_detail.first_name}</div>
                <div> - {option.slug}</div>
            </div>
        );
    };

    const loanBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <div>
                    {" "}
                    {rowData?.payable_detail[0]?.deposit_detail?.kyc_detail?.first_name}- {rowData?.payable_detail[0]?.deposit_detail.slug}
                </div>
            </>
        );
    };

    const selectedLoanTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div> {option.kyc_detail.first_name}</div>
                    <div> - {option.slug}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };
    const onSubmit = (event) => {
        event.preventDefault();
        setFormValue({
            searchCreatedAtDateFrom: fromCreatedAtSearch,
            searchCreatedAtDateTo: toCreatedAtSearch,
        });
    };
    const clearForm = () => {
        setFromCreatedAtSearch("");
        setToCreatedAtSearch("");
        setFormValue({
            searchCreatedAtDateFrom: "",
            searchCreatedAtDateTo: "",
        });
    };
    const handleLoanDateSearch = (e) => {
        setFromCreatedAtSearch(e.target.value?.toLocaleDateString());
    };
    const handleLoanToDateSearch = (e) => {
        setToCreatedAtSearch(e.target.value?.toLocaleDateString());
    };
    const onHandleSearchChange = (e) => {
        setSearch(e.target.value);
    };
    const handleAmountChange = (e) => {
        formik.setFieldValue("amount", e.value);
    };
    return (
        <div className="grid crud-demo">
            <Meta title={"Payments"} />
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />


                    <form onSubmit={onSubmit}>

                        <div className="card grid justify-content-between" style={{ background: "linear-gradient(to right, #cac531, #f3f9a7)" }}>
                            <div className="col-12 md:col-3 xl:col-3">
                                <div className="flex mb-3">
                                    <div className="mt-4 xl:w-15rem sm:w-full w-full">
                                        <InputText className=" w-full" value={search} id="search" type="text" name="Search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 md:col-3 xl:col-3" style={{ gap: "4px" }}>
                            <Calendar placeholder="Payment Date from" value={fromCreatedAtSearch} className="mb-2 w-full" onChange={(e) => handleLoanDateSearch(e)} />
                            <Calendar placeholder="Payment Date to" value={toCreatedAtSearch} className="w-full" onChange={(e) => handleLoanToDateSearch(e)} />
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
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={payments}
                        dataKey="id"
                        paginator
                        rows={10}
                        onPage={onPage}
                        lazy
                        first={lazyState.first}
                        totalRecords={payment?.count}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} payments"
                        emptyMessage="No Payments are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="deposit" header="Deposit" body={loanBodyTemplate}></Column>
                        <Column field="amount" header="Amount" body={nameBodyTemplate}></Column>
                        <Column field="created_at" header="Created At" body={created_atBodyTemplate}></Column>
                        <Column field="active" header="Status" dataType="boolean" body={statusBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={loanDialog} style={{ width: "500px" }} header="Payments" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2" autoComplete="off">
                            <div className="field">
                                <label htmlFor="deposit">Deposit</label>
                                <Dropdown
                                    value={formik.values.deposit}
                                    name="deposit"
                                    id="deposit"
                                    onChange={formik.handleChange("deposit")}
                                    options={deposits}
                                    filter
                                    filterBy="kyc_detail.first_name,slug"
                                    valueTemplate={selectedLoanTemplate}
                                    itemTemplate={loanOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select Deposit"
                                    style={{ height: "40px" }}
                                    className={formik.touched.shareholder && formik.errors.shareholder && "p-invalid"}
                                />
                                {formik.errors.shareholder && formik.touched.shareholder && <p className="error">{formik.errors.shareholder}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between">
                                <div className="field">
                                    <label htmlFor="amount">Amount</label>
                                    <br />
                                    <InputNumber value={formik.values.amount} className={`w-full md:w-15rem ${formik.touched.amount && formik.errors.amount && "p-invalid"}`} placeholder="Amount" name="amount" id="amount"  onChange={handleAmountChange} />
                                    {formik.errors.amount && formik.touched.amount && <p className="error">{formik.errors.amount}</p>}
                                </div>
                            </div>

                            <PaymentDialogFooter />
                        </form>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Payment);
