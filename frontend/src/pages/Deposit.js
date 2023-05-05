import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useAddDepositMutation, useGetDepositQuery, useGetKycQuery, useUpdateDepositMutation, useDeleteDepositMutation } from "../service/Api";
import { useFormik } from "formik";
import * as Yup from "yup";
const Deposit = () => {

    const depositchoice = [
        { name: "Monthly", value: "Monthly" },
        { name: "Quarterly", value: "Quarterly" },
        { name: "Halfyearly", value: "Halfyearly" },
        { name: "Yearly", value: "Yearly" },
    ];

    const initialState =
        {
            id: null,
            kyc: null,
            amount: null,
            interest_type: null,
            deposited_on: null,
            withdrawn_on: null,
        }

    const [addDeposit] = useAddDepositMutation();
    const [deposits, setDeposits] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [depositDialog, setDepositDialog] = useState(false);
    const [deleteDepositDialog, setDeleteDepositDialog] = useState(false);
    const [deleteDepositsDialog, setDeleteDepositsDialog] = useState(false);
    const [deposit, setDeposit] = useState(initialState);
    const [selectedDeposits, setSelectedDeposits] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: kyc_id } = useGetKycQuery();
    const { data: dep } = useGetDepositQuery();
    const [deleteDeposit] = useDeleteDepositMutation();
    const [updateDeposit] = useUpdateDepositMutation();

    useEffect(() => {
        setKycs(kyc_id);
        console.log(kyc_id);
    }, [kyc_id]);

    useEffect(() => {
        setDeposits(dep);
    }, [dep]);


    const depositTypeSchema = Yup.object().shape({
        kyc: Yup.string().required("This field is required"),
        amount: Yup.number().required("This field is required").moreThan(0),
        interest_type: Yup.string().required("This field is required"),
        deposited_on: Yup.date().required("This field is required"),
        withdrawn_on: Yup.date().required("This field is required"),
    });
    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            amount: null,
            interest_type: null,
            deposited_on: null,
            withdrawn_on: null,
        },
        validationSchema: depositTypeSchema,
        onSubmit: async (values) => {
            const { kyc, amount, interest_type, deposited_on, withdrawn_on } = values;
            let _deposits = [...deposits];
            let _deposit = { ...deposit };

            if (deposit.id) {
                console.log(_deposit);
                const index = findIndexById(deposit.id);
                _deposits[index] = _deposit;
                await updateDeposit({ id: deposit.id, kyc, amount, interest_type, deposited_on, withdrawn_on }).unwrap
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Kyc Updated", life: 3000 }))
                    .catch((error) =>
                        toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }))
} else {
                await addDeposit({ kyc, amount, interest_type, deposited_on, withdrawn_on }).unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "User Kyc Created", life: 3000 }))
                .catch((error) =>
                    toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 })
                );

        }
        setDeposits(_deposits);

        setDepositDialog(false);
            setDeposit(initialState);
        },
    });

    const openNew = () => {
        setDeposit(initialState);
        setDepositDialog(true);
        formik.setValues(initialState)
        formik.resetForm()
    };

    const hideDialog = () => {
        setDepositDialog(false);
    };

    const hideDeleteDepositDialog = () => {
        setDeleteDepositDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteDepositsDialog(false);
    };

    const editDeposit = (deposited) => {
        console.log("deposit",deposited);
        setDeposit({ ...deposited });
        formik.setValues({ ...deposited })
        setDepositDialog(true);
        console.log(formik.values);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < deposits.length; i++) {
            if (deposits[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteDeposit = (deposit) => {
        setDeposit(deposit);
        setDeleteDepositDialog(true);
    };

    const deleteProduct = () => {
        deleteDeposit(deposit.id);
        setDeleteDepositDialog(false);
        setDeposit({});
        toast.current.show({ severity: "success", summary: "Successful", detail: "Product Deleted", life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteDepositsDialog(true);
    };

    const deleteSelectedProducts = async () => {
        let _deposits = deposits.filter((val) => !selectedDeposits.includes(val));
        await selectedDeposits.map((a) => {
            deleteDeposit(a.id);
        });

        setDeposits(_deposits);
        setDeleteDepositsDialog(false);
        setSelectedDeposits(null);
        toast.current.show({ severity: "success", summary: "Successful", detail: "Products Deleted", life: 3000 });
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedDeposits || !selectedDeposits.length} />
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

    const kycDetailBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">First name</span>
                {rowData.kyc_detail.first_name} ({rowData.kyc_detail.pan})
            </>
        );
    };

    const amountBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {rowData.amount}
            </>
        );
    };

    const interestTypeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {rowData.interest_type}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editDeposit(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteDeposit(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Deposits</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const ShareDialogFooter = () => (
        <p className="p-dialog-footer">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );
    const deleteShareDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDepositDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteProduct} />
        </>
    );
    const deleteDepositsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
        </>
    );
    const userOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <div>{option.first_name}</div>
                <div> - {option.pan}</div>
            </div>
        );
    };

    const selectedUserTemplate = (option, props) => {
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
                        value={deposits}
                        selection={selectedDeposits}
                        onSelectionChange={(e) => setSelectedDeposits(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deposits"
                        globalFilter={globalFilter}
                        emptyMessage="No Deposits are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                        <Column field="kyc" header="Users" sortable body={kycDetailBodyTemplate}></Column>
                        <Column field="amount" header="Amount" sortable body={amountBodyTemplate}></Column>
                        <Column field="interest_type" header="Interest Type" sortable body={interestTypeBodyTemplate}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={depositDialog} style={{ width: "450px" }} header="Deposits" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">

                            <div className="field">
                                <label htmlFor="kyc">KYC User</label>
                                <Dropdown
                                    className={formik.touched.kyc && formik.errors.kyc && "p-invalid"}
                                    name="kyc"
                                    value={formik.values.kyc}
                                    id="kyc"
                                    onChange={formik.handleChange("kyc")}
                                    options={kycs}
                                    valueTemplate={selectedUserTemplate}
                                    itemTemplate={userOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select User"
                                    style={{ height: "40px" }}
                                />
                                  {(formik.errors.kyc&&formik.touched.kyc)&& <p className="error">{formik.errors.kyc}</p>}
                            </div>
                            <div className="field">
                                <label htmlFor="amount">Amount</label>
                                <InputText className={formik.touched.amount && formik.errors.amount && "p-invalid"} value={formik.values.amount||""}  name="amount" id="amount" type="number" onChange={formik.handleChange("amount")} />
                                {(formik.errors.amount&&formik.touched.amount)&& <p className="error">{formik.errors.amount}</p>}

                            </div>
                            <div className="field">
                                <label htmlFor="interest_type">Interest Type</label>
                                <Dropdown
                                    className={formik.touched.interest_type && formik.errors.interest_type && "p-invalid"}
                                    value={formik.values.interest_type}
                                    name="interest_type"
                                    onChange={formik.handleChange("interest_type")}
                                    options={depositchoice}
                                    optionLabel="name"
                                    placeholder="Select Interest type"
                                    style={{ height: "40px" }}
                                />
                        {(formik.errors.interest_type&&formik.touched.interest_type)&& <p className="error">{formik.errors.interest_type}</p>}
                            </div>

                            <div className="field">
                                <label htmlFor="deposited_on">Deposited On</label>
                                <Calendar className={formik.touched.deposited_on && formik.errors.deposited_on && "p-invalid"} value={formik.values.id&&new Date(formik.values.deposited_on)} name="deposited_on" onChange={formik.handleChange("deposited_on")} showTime hourFormat="24" />
                                {(formik.errors.deposited_on&&formik.touched.deposited_on)&& <p className="error">{formik.errors.deposited_on}</p>}
                            </div>

                            <div className="field">
                                <label htmlFor="withdrawn_on">Withdrawn On</label>
                                <Calendar className={formik.touched.withdrawn_on && formik.errors.withdrawn_on && "p-invalid"} value={formik.values.id&&new Date(formik.values.withdrawn_on)} name="withdrawn_on" onChange={formik.handleChange("withdrawn_on")} showTime hourFormat="24" />
                                {(formik.errors.withdrawn_on&&formik.touched.withdrawn_on)&& <p className="error">{formik.errors.withdrawn_on}</p>}
                            </div>
                            {<ShareDialogFooter />}
                        </form>
                    </Dialog>

                    <Dialog visible={deleteDepositDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteShareDialogFooter} onHide={hideDeleteDepositDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {deposit && (
                                <span>
                                    Are you sure you want to delete <b>{deposit.share_value}</b>?
                                </span>
                            )}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteDepositsDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteDepositsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {deposit && <span>Are you sure you want to delete the selected shares?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Deposit);
