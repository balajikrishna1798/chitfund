import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Calendar } from 'primereact/calendar';
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useAddLoanMutation, useGetLoanQuery, useGetKycQuery,useUpdateLoanMutation,useDeleteLoanMutation } from "../service/Api";
import { useFormik } from "formik";
import * as Yup from "yup";

const Loan = () => {
    const loanchoice = [
        { name: "EMI", value: "EMI" },
        { name: "Term Loan", value: "Term Loan" },

    ];
    const initialState = {
        id: null,
        kyc: null,
        amount: null,
        interest_type: null,
        loan_date_on: null,
        loan_closed_on: null,
    };
    const [addLoan] = useAddLoanMutation();
    const [loans, setLoans] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [shareDialog, setShareDialog] = useState(false);
    const [deleteShareDialog, setDeleteProductDialog] = useState(false);
    const [deleteSharesDialog, setDeleteProductsDialog] = useState(false);
    const [loan, setLoan] = useState(initialState);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: kyc_id } = useGetKycQuery();
    const { data: dep } = useGetLoanQuery();
    const [deleteLoan] = useDeleteLoanMutation();
    const [updateLoan] = useUpdateLoanMutation();
    const { kyc, amount, interest_type,loan_date_on, loan_closed_on} = loan;

    useEffect(() => {
        setKycs(kyc_id);
        console.log(kyc_id);
    }, [kyc_id]);

    useEffect(() => {
        setLoans(dep);
    }, [dep]);
    const depositTypeSchema = Yup.object().shape({
        kyc: Yup.string().required("This field is required"),
        amount: Yup.number().required("This field is required").moreThan(0),
        interest_type: Yup.string().required("This field is required"),
        loan_date_on: Yup.date().required("This field is required"),
        loan_closed_on: Yup.date().required("This field is required"),
    });
    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            amount: null,
            interest_type: null,
            loan_date_on: null,
            loan_closed_on: null,
        },
        validationSchema: depositTypeSchema,
        onSubmit: async (values) => {
            const { kyc, amount, interest_type,loan_date_on, loan_closed_on} = values;

            let _deposits = [...loans];
            let _deposit = { ...loan };

            if (loan.id) {
                console.log("y");
                const index = findIndexById(loan.id);
                _deposits[index] = _deposit;
                await updateLoan({ id: loan.id, kyc, amount, interest_type, loan_date_on, loan_closed_on });
                toast.current.show({ severity: "success", summary: "Successful", detail: "Product Updated", life: 3000 });
            } else {
                console.log("s");
                await addLoan({ kyc, amount, interest_type, loan_date_on, loan_closed_on }).unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull",detail:"Loan Created", life: 3000 }))
                .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Server Error", life: 3000 }))

            }

            setLoans(_deposits);
            setShareDialog(false);
            setLoan(_deposit);
 } })

    const openNew = () => {
        formik.resetForm()
        setLoan(initialState);
        setShareDialog(true);
        formik.setValues(initialState)
    };

    const hideDialog = () => {
        setShareDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };


    const editProduct = (loan) => {
        // formik.resetForm()
        setLoan({ ...loan });
        formik.setValues({ ...loan })
        setShareDialog(true);
    };
    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < loans.length; i++) {
            if (loans[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteProduct = (loan) => {
        setLoan(loan);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        deleteLoan(loan.id);
        setDeleteProductDialog(false);
        setLoan({});
        toast.current.show({ severity: "success", summary: "Successful", detail: "Product Deleted", life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = async () => {
        let _deposits = loans.filter((val) => !selectedProducts.includes(val));
        await selectedProducts.map((a) => {
            deleteLoan(a.id);
        });

        setLoans(_deposits);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({ severity: "success", summary: "Successful", detail: "Products Deleted", life: 3000 });
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
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

    const codeBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.kyc_detail.first_name} ({rowData.kyc_detail.pan})
            </>
        );
    };


    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.amount}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteProduct(rowData)} />
            </div>
        );
    };


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">ShareTypes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const LoanDialogFooter =() => (
        <p className="p-dialog-footer">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text"  />
        </p>
    );
    const deleteShareDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
        </>
    );
    const deleteSharesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
        </>
    );
    const countryOptionTemplate = (option) => {
        console.log("option", option);
        return (
            <div className="flex align-items-center">
                <div>{option.first_name}</div>
                <div> - {option.pan}</div>
            </div>
        );
    };

    const selectedCountryTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.first_name}</div>
                    <div> - {option.pan}</div>
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
                        value={loans}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} loans"
                        globalFilter={globalFilter}
                        emptyMessage="No shares found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                        <Column field="kyc" header="KYC" sortable body={codeBodyTemplate}></Column>
                        <Column field="amount" header="Amount" sortable body={nameBodyTemplate}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={shareDialog} style={{ width: "450px" }} header="ShareTypes" modal className="p-fluid" onHide={hideDialog}>
                    <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">

                        <div className="field">
                            <label htmlFor="kyc">KYC ID</label>
                            <Dropdown value={formik.values.kyc} name="kyc" id="kyc" onChange={formik.handleChange("kyc")} options={kycs} valueTemplate={selectedCountryTemplate} itemTemplate={countryOptionTemplate} optionLabel="pan" optionValue="id" placeholder="Select User" style={{ height: "40px" }} className={formik.touched.kyc && formik.errors.kyc && "p-invalid"} />
                            {(formik.errors.kyc&&formik.touched.kyc)&& <p className="error">{formik.errors.kyc}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="amount">Amount</label>
                            <InputText value={formik.values.amount || 0}
                            className={formik.touched.amount && formik.errors.amount && "p-invalid"}
                            name="amount" id="amount" type="number" onChange={formik.handleChange("amount")} />
                               {(formik.errors.amount&&formik.touched.amount)&& <p className="error">{formik.errors.amount}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="interest_type">Interest Type</label>
                            <Dropdown value={formik.values.interest_type||""}
                            className={formik.touched.interest_type && formik.errors.interest_type && "p-invalid"}
                            name="interest_type" onChange={formik.handleChange("interest_type")} options={loanchoice} optionLabel="name" placeholder="Select Interest type" style={{ height: "40px" }} />
                              {(formik.errors.interest_type&&formik.touched.interest_type)&& <p className="error">{formik.errors.interest_type}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="loan_date_on">Loan Date On</label>
                            <Calendar value={formik.values.id&&new Date(formik.values.loan_date_on)} name="loan_date_on"
                            className={formik.touched.loan_date_on && formik.errors.loan_date_on && "p-invalid"}
                            onChange={formik.handleChange("loan_date_on")} showTime hourFormat="24" />
  {(formik.errors.loan_date_on&&formik.touched.loan_date_on)&& <p className="error">{formik.errors.loan_date_on}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="loan_closed_on">Loan Closed On</label>
                            <Calendar
                            className={formik.touched.loan_closed_on && formik.errors.loan_closed_on && "p-invalid"}
                            value={formik.values.id&&new Date(formik.values.loan_closed_on)} name="loan_closed_on" onChange={formik.handleChange("loan_closed_on")} showTime hourFormat="24" />
                            {(formik.errors.loan_closed_on&&formik.touched.loan_closed_on)&& <p className="error">{formik.errors.loan_closed_on}</p>}
                        </div>
                        <LoanDialogFooter />
                        </form>

                    </Dialog>

                    <Dialog visible={deleteShareDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteShareDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {loan && (
                                <span>
                                    Are you sure you want to delete <b>{loan.share_value}</b>?
                                </span>
                            )}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteSharesDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteSharesDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {loan && <span>Are you sure you want to delete the selected shares?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Loan);
