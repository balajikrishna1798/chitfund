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
import { useAddDepositMutation, useGetDepositQuery, useUpdateDepositMutation } from "../service/DepositApi";
import { useFormik } from "formik";
import { Tag } from 'primereact/tag';
import './Loan.css'
import * as Yup from "yup";
import { slugBodyTemplate } from "../components/SlugBodyTemplate";
import { useGetKycShareholderQuery } from "../service/KycApi";
const Deposit = () => {
    const depositchoice = [
        { value: "3 Months", name: "3 Months" },
        { value: "6 Months", name: "6 Months" },
        { value: "12 Months", name: "12 Months" },
        { value: "18 Months", name: "18 Months" },
        { value: "24 Months", name: "24 Months" },
        { value: "30 Months", name: "30 Months" },
        { value: "36 Months", name: "36 Months" },
    ];

    const [addDeposit] = useAddDepositMutation();
    const [deposits, setDeposits] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [depositDialog, setDepositDialog] = useState(false);
    const [selectedDeposits, setSelectedDeposits] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: shareholder_id } = useGetKycShareholderQuery();
    const { data: dep } = useGetDepositQuery();
    const [updateDeposit] = useUpdateDepositMutation();

    useEffect(() => {
        setKycs(shareholder_id);
        console.log(shareholder_id);
    }, [shareholder_id]);

    useEffect(() => {
        setDeposits(dep);
    }, [dep]);

    const depositTypeSchema = Yup.object().shape({
        shareholder: Yup.string().required("This field is required"),
        amount: Yup.number().required("This field is required").moreThan(0).test(
            "maxDigitsAfterDecimal",
            "number field must have 4 digits after decimal or less",
            (number) => /^\d+(\.\d{1,4})?$/.test(number)
          ),
        roi: Yup.number().required("This field is required"),
        interest_type: Yup.string().required("This field is required"),
        deposited_on: Yup.date().required("This field is required"),
        withdrawn_on: Yup.date().required("This field is required"),
    });
    const formik = useFormik({
        initialValues: {
            id: null,
            shareholder: null,
            amount: null,
            interest_type: null,
            deposited_on: null,
            withdrawn_on: null,
            roi:null
        },
        validationSchema: depositTypeSchema,
        onSubmit: async (values) => {

            const { id,shareholder, amount, interest_type, deposited_on, withdrawn_on,roi } = values;
            let _deposits = [...deposits];
            let _deposit = { ...values };

            if (values.id) {
                const index = findIndexById(values.id);
                _deposits[index] = _deposit;
                await updateDeposit({ id, shareholder, amount, interest_type, deposited_on, withdrawn_on,roi })
                    .unwrap().then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Deposit Updated", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                setDepositDialog(false);
            } else {
                await addDeposit({ shareholder, amount, interest_type, deposited_on, withdrawn_on,roi })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Deposit Created", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                setDepositDialog(false);
            }
            setDeposits(_deposits);

        },
    });

    const openNew = () => {
        setDepositDialog(true);
        formik.resetForm();
    };

    const hideDialog = () => {
        setDepositDialog(false);
    };



    const editDeposit = (deposited) => {
        console.log("deposit", deposited);
        formik.setValues({ ...deposited });
        setDepositDialog(true);
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

    const kycDetailBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">First name</span>
                {rowData.shareholder_detail.kyc_detail.first_name} ({rowData.shareholder_detail.kyc_detail.pan})
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

    const deposited_onBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {new Date(rowData.deposited_on).toLocaleString()}
            </>
        );
    };

    const created_atBodyTemplate = (rowData) => {
       console.log(rowData);
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {new Date(rowData.created_at).toLocaleString()}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editDeposit(rowData)} />
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


    const shareholderOptionTemplate = (option) => {
        console.log(option);
        return (
            <div className="flex align-items-center">
                <div>{option.first_name}</div>
                <div> - {option.pan}</div>
            </div>
        );
    };

    const selectedShareholderTemplate = (option, props) => {
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
                        <Column field="slug" header="Deposit ID" sortable body={slugBodyTemplate}></Column>
                        <Column field="kyc" header="Shareholders" sortable body={kycDetailBodyTemplate}></Column>
                        <Column field="amount" header="Amount" sortable body={amountBodyTemplate}></Column>
                        <Column field="interest_type" header="Interest Type" sortable body={interestTypeBodyTemplate}></Column>
                        <Column field="loan_date_on" header="Deposited On" sortable body={deposited_onBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" sortable body={created_atBodyTemplate}></Column>
                        <Column field="status" header="Status" sortable body={statusBodyTemplate
}></Column>

                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={depositDialog} style={{ width: "500px" }} header="Deposits" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="field">
                                <label htmlFor="kyc">Shareholder</label>
                                <Dropdown
                                    className={formik.touched.kyc && formik.errors.kyc && "p-invalid"}
                                    name="kyc"
                                    value={formik.values.kyc}
                                    id="kyc"
                                    onChange={formik.handleChange("kyc")}
                                    options={kycs}
                                    valueTemplate={selectedShareholderTemplate}
                                    itemTemplate={shareholderOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select User"
                                    style={{ height: "40px" }}
                                />
                                {formik.errors.kyc && formik.touched.kyc && <p className="error">{formik.errors.kyc}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between ">

                            <div className="field">
                                <label htmlFor="amount">Amount</label><br />
                                <InputText className={`w-full md:w-15rem ${formik.touched.amount && formik.errors.amount && "p-invalid"}`} value={formik.values.amount || ""}
                                step="100"
                                name="amount" id="amount" type="number" onChange={formik.handleChange("amount")} />
                                {formik.errors.amount && formik.touched.amount && <p className="error">{formik.errors.amount}</p>}
                            </div>
                            <div className="field">
                                <label htmlFor="interest_type">Interest Type</label>
                                <Dropdown
                                    className={`w-full md:w-15rem ${formik.touched.interest_type && formik.errors.interest_type && "p-invalid"}`}

                                    value={formik.values.interest_type}
                                    name="interest_type"
                                    onChange={formik.handleChange("interest_type")}
                                    options={depositchoice}
                                    optionLabel="name"
                                    placeholder="Select Interest type"
                                />
                                {formik.errors.interest_type && formik.touched.interest_type && <p className="error">{formik.errors.interest_type}</p>}
                            </div>
                            </div>
                            <div className="field">
                                <label htmlFor="roi">Rate Of Interest</label>
                                <InputText className={`${formik.touched.roi && formik.errors.roi && "p-invalid"}`}

                                value={formik.values.roi || ""} name="roi" id="roi" type="number" onChange={formik.handleChange("roi")} />
                                {formik.errors.roi && formik.touched.roi && <p  style={{marginLeft:"30px"}} className="error">{formik.errors.roi}</p>}
                            </div>

                            <div className="flex flex-column md:flex-row justify-content-between ">
                            <div className="field">
                                <label htmlFor="deposited_on">Deposited On</label>
                                <Calendar className={formik.touched.deposited_on && formik.errors.deposited_on && "p-invalid"} value={formik.values.id && new Date(formik.values.deposited_on)} name="deposited_on" onChange={formik.handleChange("deposited_on")} showTime hourFormat="24" />
                                {formik.errors.deposited_on && formik.touched.deposited_on && <p className="error">{formik.errors.deposited_on}</p>}
                            </div>

                            <div className="field">
                                <label htmlFor="withdrawn_on">Maturity Term</label>
                                <Calendar className={formik.touched.withdrawn_on && formik.errors.withdrawn_on && "p-invalid"} value={formik.values.id && new Date(formik.values.withdrawn_on)} name="withdrawn_on" onChange={formik.handleChange("withdrawn_on")} showTime hourFormat="24" />
                                {formik.errors.withdrawn_on && formik.touched.withdrawn_on && <p className="error">{formik.errors.withdrawn_on}</p>}
                            </div>
                            </div>
                            <div className="card">
                                <table className="tabler">
                                    <tr>
                                        <th className="thr">Amount</th>
                                        <th className="thr">Rate of Interest</th>
                                        <th className="thr">Payable amount</th>
                                    </tr>
                                    <tr>
                                        <td className="tdr">{formik.values.amount}</td>
                                        <td className="tdr">{formik.values.roi}</td>
                                        <td className="tdr">{formik.values.amount * formik.values.roi}</td>
                                    </tr>
                                </table>
                            </div>
                            {<ShareDialogFooter />}
                        </form>
                    </Dialog>


                </div>
            </div>
        </div>
    );
};

export default React.memo(Deposit);
