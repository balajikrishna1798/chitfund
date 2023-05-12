import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useAddPaymentMutation, useGetPaymentQuery, useGetShareholderQuery,useGetLoanQuery } from "../service/Api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Tag } from 'primereact/tag';

const Receipt = () => {
    const [addPayment] = useAddPaymentMutation();
    const [payments, setPayments] = useState(null);
    const [shareholders, setShareholders] = useState(null);
    const [loanDialog, setLoanDialog] = useState(false);
    const [loans, setLoans] = useState(null);
    const [selectedLoans, setSelectedLoans] = useState(null);
    const [temp, setTemp] = useState(null)
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: shareholder } = useGetShareholderQuery();
    const { data: payment } = useGetPaymentQuery();
    const { data: loan } = useGetLoanQuery();

    useEffect(() => {
        setShareholders(shareholder);
        console.log(shareholder);
    }, [shareholder]);

    useEffect(() => {
        console.log(loan);
        setLoans(loan?.filter((a)=>a.id==1));
        // setTemp((loan))
    }, [loan,formik?.values?.shareholder]);

    useEffect(() => {
        setPayments(payment);
    }, [payment]);

    const paymentTypeSchema = Yup.object().shape({
        shareholder: Yup.string().required("This field is required"),
        amount: Yup.number()
            .required("This field is required")
            .moreThan(0)
            .test("maxDigitsAfterDecimal", "number field must have 4 digits after decimal or less", (number) => /^\d+(\.\d{1,4})?$/.test(number)),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            shareholder: null,
            amount: null,
            loan:null
        },
        validationSchema: paymentTypeSchema,
        onSubmit: async (values) => {
            const { shareholder, amount,loan } = values;

            let _payments = [...payments];

            await addPayment({ shareholder, amount,loan })
                .unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Receipt Created", life: 3000 }))
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
        return <Tag style={{width:50,height:30}} value={`${product.active===true?"Active":"InActive"}`} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        console.log(product);
        switch (product.active) {
            case true:
                return 'success';

            case false:
                return 'warning';


            default:
                return null;
        }
    };


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Payments</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const PaymentDialogFooter = () => (
        <p className="p-dialog-footer mb-0">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );

    const shareholderOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <div>{option.kyc_detail.first_name}</div>
                <div> - {option.kyc_detail.pan}</div>
            </div>
        );
    };

    const loanOptionTemplate = (option) => {
        console.log('ppppp',loans);
        return (
            <div className="flex align-items-center">
                {/* <div>{option.shareholder_detail.kyc_detail.first_name}</div> */}
                {loans.filter(a=>{
                    console.log('a',a)
                return a.id==1
                }).map(data=>{
                    return data.shareholder_detail.kyc_detail.first_name
                }
                    )}
                {/* {option.shareholder_detail.id===option.shareholder} */}
                 <div> - {option.interest_type}</div>
            </div>
        );
    };

    const selectedShareholderTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.kyc_detail.first_name}</div>
                    <div> - {option.kyc_detail.pan}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const selectedLoanTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{
                    option.shareholder_detail.kyc_detail.first_name
                    }</div>
                    <div> - {option.interest_type}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={payments}
                        selection={selectedLoans}
                        onSelectionChange={(e) => setSelectedLoans(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} payments"
                        globalFilter={globalFilter}
                        emptyMessage="No Payments are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column field="shareholder" header="Shareholders" sortable body={codeBodyTemplate}></Column> */}
                        <Column field="amount" header="Amount" sortable body={nameBodyTemplate}></Column>
                        <Column field="active" header="Status" dataType="boolean" sortable body={statusBodyTemplate}></Column>

                    </DataTable>

                    <Dialog visible={loanDialog} style={{ width: "500px" }} header="Payments" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="field">
                                <label htmlFor="shareholder">Shareholder</label>
                                <Dropdown
                                    value={formik.values.shareholder}
                                    name="shareholder"
                                    id="shareholder"
                                    onChange={formik.handleChange("shareholder")}
                                    options={shareholders}
                                    valueTemplate={selectedShareholderTemplate}
                                    itemTemplate={shareholderOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select Shareholder"
                                    style={{ height: "40px" }}
                                    className={formik.touched.shareholder && formik.errors.shareholder && "p-invalid"}
                                />
                                {formik.errors.shareholder && formik.touched.shareholder && <p className="error">{formik.errors.shareholder}</p>}

</div>
                            <div className="field">
                                <label htmlFor="loan">Loan</label>
                                <Dropdown
                                    value={formik.values.loan}
                                    name="loan"
                                    id="loan"
                                    onChange={formik.handleChange("loan")}
                                    options={loans}
                                    valueTemplate={selectedLoanTemplate}
                                    itemTemplate={loanOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select Loan"
                                    style={{ height: "40px" }}
                                    className={formik.touched.shareholder && formik.errors.shareholder && "p-invalid"}
                                />
                                {formik.errors.shareholder && formik.touched.shareholder && <p className="error">{formik.errors.shareholder}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between">
                                <div className="field">
                                    <label htmlFor="amount">Amount</label>
                                    <br />
                                    <InputText value={formik.values.amount} className={`w-full md:w-15rem ${formik.touched.amount && formik.errors.amount && "p-invalid"}`} placeholder="Amount" name="amount" id="amount" type="number" step="0.1" onChange={formik.handleChange("amount")} />
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

export default React.memo(Receipt);
