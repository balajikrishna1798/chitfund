import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";

import { Dropdown } from "primereact/dropdown";
import { useAddDepositMutation, useGetDepositQuery, useUpdateDepositMutation } from "../service/DepositApi";
import moment from "moment";
import { useFormik } from "formik";
import { Tag } from "primereact/tag";
import "./Loan.css";
import * as Yup from "yup";
import { slugBodyTemplate } from "../components/SlugBodyTemplate";
import { useGetKycShareholderQuery } from "../service/KycApi";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import "./common.css";
import Meta from "../components/Meta";
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
    const [fromMaturityDateSearch, setFromMaturityDateSearch] = useState("");
    const [toMaturityDateSearch, setToMaturityDateSearch] = useState("");
    const [search, setSearch] = useState("");

    const [formValue, setFormValue] = useState({
        searchDepositDateFrom: "",
        searchDepositDateTo: "",
        searchMaturityDateFrom: "",
        searchMaturityDateTo: "",
    });
    const [kycs, setKycs] = useState(null);
    const [depositDialog, setDepositDialog] = useState(false);
    const [selectedDeposits, setSelectedDeposits] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: shareholder_id } = useGetKycShareholderQuery();
    const [fromDepositDateSearch, setFromDepositDateSearch] = useState("");
    const [toDepositDateSearch, setToDepositDateSearch] = useState("");
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 2,
        page: 0,
    });
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let day = today.getDate();
    let prevdate = day === 0 ? 11 : day - 5;
    let prevMonth = month === 0 ? 11 : month - 1;
    let prevYear = prevMonth === 11 ? year - 1 : year;
    let nextdate = day === 0 ? 11 : day;
    let nextMonth = month === 11 ? 0 : month + 1;
    let nextYear = nextMonth === 0 ? year + 1 : year;
    let minDate = new Date();

    minDate.setDate(prevdate);
    minDate.setFullYear(prevYear);

    let maxDate = new Date();
    maxDate.setDate(nextdate);
    maxDate.setFullYear(nextYear);
    const { data: deposit,isLoading } = useGetDepositQuery({
        page: lazyState?.page,
        search: search,
        searchDepositDateOn: formValue.searchDepositDateFrom,
        searchDepositDateTo: formValue.searchDepositDateTo,
        searchMaturityDateFrom: formValue.searchMaturityDateFrom,
        searchMaturityDateTo: formValue.searchMaturityDateTo,
    });
    const [updateDeposit] = useUpdateDepositMutation();

    useEffect(() => {
        setKycs(shareholder_id);
    }, [shareholder_id]);

    useEffect(() => {
        setDeposits(deposit && deposit.results);
    }, [deposit]);

    const onPage = (event) => {
        console.log("event", event);
        setlazyState(event);
    };

    const depositTypeSchema = Yup.object().shape({
        kyc: Yup.string().required("This field is required"),
        amount: Yup.number()
            .required("This field is required")
            .moreThan(0)
            .test("maxDigitsAfterDecimal", "number field must have 4 digits after decimal or less", (number) => /^\d+(\.\d{1,4})?$/.test(number)),
        roi: Yup.number().required("This field is required"),
        interest_type: Yup.string().required("This field is required"),
        deposited_on: Yup.date().required("This field is required"),
    });
    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            amount: null,
            interest_type: null,
            deposited_on: null,
            roi: null,
        },
        validationSchema: depositTypeSchema,
        onSubmit: async (values) => {
            const { id, kyc, amount, interest_type, deposited_on, withdrawn_on, roi } = values;
            let _deposits = [...deposits];
            let _deposit = { ...values };

            if (values.id) {
                const index = findIndexById(values.id);
                _deposits[index] = _deposit;
                await updateDeposit({ id, kyc, amount, interest_type, deposited_on, withdrawn_on, roi })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Deposit Updated", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                setDepositDialog(false);
            } else {
                await addDeposit({ kyc, amount, interest_type, deposited_on, withdrawn_on, roi })
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
                {rowData.kyc_detail.first_name}
            </>
        );
    };

    const kycIDBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">First name</span>
                <span>{rowData.kyc_detail.slug}</span>
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
    const maturityTerm_onBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {moment(rowData.maturity_term).format("DD-MM-YYYY, HH:mm:ss")}
            </>
        );
    };

    const deposited_onBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {moment(rowData.deposited_on).format("DD-MM-yyyy, HH:mm:ss")}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editDeposit(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center grad">
            <h5 className="m-0">Deposits</h5>
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
                <div> - {option.slug}</div>
            </div>
        );
    };

    const selectedShareholderTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.first_name}</div>
                    <div> - {option.slug}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        setFormValue({
            searchDepositDateFrom: fromDepositDateSearch,
            searchDepositDateTo: toDepositDateSearch,
            searchMaturityDateFrom: fromMaturityDateSearch,
            searchMaturityDateTo: toMaturityDateSearch,
        });
    };
    const clearForm = () => {
        setFromDepositDateSearch("");
        setToDepositDateSearch("");
        setFromMaturityDateSearch("");
        setToMaturityDateSearch("");
        setFormValue({
            searchDepositDateFrom: "",
            searchDepositDateTo: "",
            searchMaturityDateFrom: "",
            searchMaturityDateTo: "",
        });
    };
    const handleDepositDateSearch = (e) => {
        setFromDepositDateSearch(e.target.value?.toLocaleDateString());
    };
    const handleDepositToDateSearch = (e) => {
        setToDepositDateSearch(e.target.value?.toLocaleDateString());
    };
    const handleMaturityDateSearch = (e) => {
        setFromMaturityDateSearch(e.target.value?.toLocaleDateString());
    };
    const handleMaturityToDateSearch = (e) => {
        setToMaturityDateSearch(e.target.value?.toLocaleDateString());
    };
    const onHandleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleAmountChange = (e) => {
        formik.setFieldValue("amount", e.value);
    };

    const handleRoiChange = (e) => {
        formik.setFieldValue("roi", e.value);
    };

    return (
        <div className="grid crud-demo">
            <Meta title={"Deposits"} />
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <form onSubmit={onSubmit}>
                        <div className="card flex xl:flex-row flex-column justify-content-between" style={{ background: "linear-gradient(to right, #cac531, #f3f9a7)",gap:"3px" }}>
                            <div className="flex flex-column w-full xl:w-13rem">
                                <InputText className="mt-4 " value={search} id="search" type="text" name="Search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                            </div>
                            <div className="flex flex-row justify-content-between" style={{gap:"15px"}}>
                            <div className="flex flex-row">
                            <div className="flex flex-column w-full xl:w-15rem md:w-17rem">

                                <Calendar placeholder="Deposited Date from" value={fromDepositDateSearch} className="mb-2" onChange={(e) => handleDepositDateSearch(e)} />
                                <Calendar placeholder="Deposited Date to" value={toDepositDateSearch} onChange={(e) => handleDepositToDateSearch(e)} />
                            </div>
                            </div>
                            <div>
                            <div className="flex flex-column w-full xl:w-15rem md:w-17rem">
                                <Calendar placeholder="Maturity Date from" value={fromMaturityDateSearch} className="mb-2" onChange={(e) => handleMaturityDateSearch(e)} />
                                <Calendar placeholder="Maturity Date to" value={toMaturityDateSearch} onChange={(e) => handleMaturityToDateSearch(e)} />
                            </div>
                            </div>
                            </div>
                            <div>
                                <Button type="submit" style={{ height: "2rem", display: "flex", justifyContent: "center" }} className="mt-3 w-full xl:w-8rem">
                                    Submit
                                </Button>
                                <Button onClick={clearForm} style={{ height: "2rem", background: "red", display: "flex", justifyContent: "center" }} className="w-full xl:w-8rem mt-2">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </form>
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
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
                    ) : (<DataTable
                        ref={dt}
                        value={deposits}
                        selection={selectedDeposits}
                        onSelectionChange={(e) => setSelectedDeposits(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        onPage={onPage}
                        lazy
                        first={lazyState.first}
                        totalRecords={deposit?.count}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deposits"
                        emptyMessage="No Deposits are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="slug" header="Deposit ID" body={slugBodyTemplate}></Column>
                        <Column field="kyc" header="Shareholders" body={kycDetailBodyTemplate}></Column>
                        <Column field="kyc_id" header="KYC ID" body={kycIDBodyTemplate}></Column>
                        <Column field="amount" header="Amount" body={amountBodyTemplate}></Column>
                        <Column field="interest_type" header="Interest Type" body={interestTypeBodyTemplate}></Column>
                        <Column field="loan_date_on" header="Deposited On" body={deposited_onBodyTemplate}></Column>
                        <Column field="maturity_term" header="Maturity Term" body={maturityTerm_onBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate}></Column>

                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>)}

                    <Dialog visible={depositDialog} style={{ width: "500px" }} header="Deposits" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="field">
                                <label htmlFor="kyc">Shareholder</label>
                                <Dropdown
                                    className={formik.touched.kyc && formik.errors.kyc && "p-invalid"}
                                    name="kyc"
                                    value={formik.values.kyc}
                                    id="kyc"
                                    filter
                                    filterBy="slug,first_name"
                                    onChange={formik.handleChange("kyc")}
                                    options={kycs}
                                    valueTemplate={selectedShareholderTemplate}
                                    itemTemplate={shareholderOptionTemplate}
                                    optionLabel="slug"
                                    optionValue="id"
                                    placeholder="Select User"
                                    style={{ height: "40px" }}
                                />
                                {formik.errors.kyc && formik.touched.kyc && <p className="error">{formik.errors.kyc}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">
                                    <label htmlFor="amount">Amount</label>
                                    <br />
                                    <InputNumber className={`w-full md:w-15rem ${formik.touched.amount && formik.errors.amount && "p-invalid"}`} value={formik.values.amount}
                                    locale="en-IN"
                                    name="amount" id="amount" onChange={handleAmountChange} />
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
                                <InputNumber className={`${formik.touched.roi && formik.errors.roi && "p-invalid"}`}
                                locale="en-IN" minFractionDigits={2} maxFractionDigits={4}
                                value={formik.values.roi} name="roi" id="roi" onChange={handleRoiChange} />
                                {formik.errors.roi && formik.touched.roi && (
                                    <p style={{ marginLeft: "30px" }} className="error">
                                        {formik.errors.roi}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">
                                    <label htmlFor="deposited_on">Deposited On</label>
                                    <Calendar
                                        className={formik.touched.deposited_on && formik.errors.deposited_on && "p-invalid"}
                                        value={formik.values.id && new Date(formik.values.deposited_on)}
                                        name="deposited_on"
                                        showTime
                                        hourFormat="24"
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        readOnlyInput
                                        onChange={formik.handleChange("deposited_on")}
                                    />
                                    {formik.errors.deposited_on && formik.touched.deposited_on && <p className="error">{formik.errors.deposited_on}</p>}
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
