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
import { useAddLoanMutation, useGetLoanQuery, useUpdateLoanMutation } from "../service/LoanApi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Tag } from "primereact/tag";
import "./Loan.css";
import { slugBodyTemplate } from "../components/SlugBodyTemplate";
import { useGetKycShareholderQuery } from "../service/KycApi";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import moment from "moment";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";
import Meta from "../components/Meta";

const Loan = () => {
    const loanchoice = [
        { name: "EMI", value: "EMI" },
        { name: "Term Loan", value: "Term Loan" },
    ];

    const emiperiodchoice = [
        { value: "3 Months", name: "3 Months" },
        { value: "6 Months", name: "6 Months" },
        { value: "12 Months", name: "12 Months" },
        { value: "18 Months", name: "18 Months" },
        { value: "24 Months", name: "24 Months" },
        { value: "30 Months", name: "30 Months" },
        { value: "36 Months", name: "36 Months" },
    ];

    const [addLoan] = useAddLoanMutation();
    const [loans, setLoans] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [loanDialog, setLoanDialog] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: shareholder_id } = useGetKycShareholderQuery();
    const [updateLoan] = useUpdateLoanMutation();
    const [fromMaturityDateSearch, setFromMaturityDateSearch] = useState("");
    const [toMaturityDateSearch, setToMaturityDateSearch] = useState("");
    const [search, setSearch] = useState("");
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [formValue, setFormValue] = useState({
        searchLoanDateFrom: "",
        searchLoanDateTo: "",
        searchMaturityDateFrom: "",
        searchMaturityDateTo: "",
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
    const [fromLoanDateSearch, setFromLoanDateSearch] = useState("");
    const [toLoanDateSearch, setToLoanDateSearch] = useState("");

    const { data: loan, isLoading } = useGetLoanQuery({
        page: lazyState?.page,
        search: search,
        searchLoanDateOn: formValue.searchLoanDateFrom,
        searchLoanDateTo: formValue.searchLoanDateTo,
        searchMaturityDateFrom: formValue.searchMaturityDateFrom,
        searchMaturityDateTo: formValue.searchMaturityDateTo,
    });
    const onPage = (event) => {
        console.log("event", event);
        setlazyState(event);
    };

    useEffect(() => {
        setKycs(shareholder_id);
    }, [shareholder_id]);

    useEffect(() => {
        setLoans(loan?.results);
    }, [loan]);
    const depositTypeSchema = Yup.object().shape({
        kyc: Yup.string().required("This field is required"),
        amount: Yup.number()
            .required("This field is required")
            .moreThan(0)
            .test("maxDigitsAfterDecimal", "number field must have 4 digits after decimal or less", (number) => /^\d+(\.\d{1,4})?$/.test(number)),
        interest_type: Yup.string().required("This field is required"),
        loan_date_on: Yup.date().required("This field is required"),
        roi: Yup.number().required("This field is required"),
    });
    const validate = (values) => {
        let errors = {};
        if (values.interest_type === "EMI" && !values.emi_period) {
            errors.emi_period = "This field is required";
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            amount: null,
            interest_type: null,
            emi_period: null,
            loan_date_on: null,
            roi: null,
        },
        validate: validate,
        validationSchema: depositTypeSchema,
        onSubmit: async (values) => {
            const { id, kyc, amount, interest_type, loan_date_on, emi_period, roi } = values;

            let _loans = [...loans];
            let _loan = { ...values };

            if (values.id) {
                const index = findIndexById(values.id);
                _loans[index] = _loan;
                await updateLoan({ id, kyc, amount, interest_type, loan_date_on, emi_period, roi })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Loan Updated", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Server Error", life: 3000 }));
            } else {
                await addLoan({ kyc, amount, interest_type, emi_period, loan_date_on, roi })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Loan Created", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Server Error", life: 3000 }));
            }

            setLoans(_loans);
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

    const editLoan = (loan) => {
        formik.setValues({ ...loan });
        setLoanDialog(true);
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

    const firstnameBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.kyc_detail.first_name}
            </>
        );
    };

    const kycIdBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.kyc_detail.slug}
            </>
        );
    };

    const amountBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.amount}
            </>
        );
    };

    const interestTypeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {rowData.interest_type}
                <br />
                {rowData.interest_type === "EMI" && "(" + rowData.emi_period + ")"}
            </>
        );
    };

    const loan_openBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {moment(rowData.loan_date_on).format("DD-MM-yyyy, HH:mm:ss")}
            </>
        );
    };

    const loan_closedBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title"> Amount</span>
                {moment(rowData.maturity_term).format("DD-MM-yyyy, HH:mm:ss")}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editLoan(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Loans</h5>
        </div>
    );

    const LoanDialogFooter = () => (
        <p className="p-dialog-footer mb-0">
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
    const onSubmit = (event) => {
        event.preventDefault();
        setFormValue({
            searchLoanDateFrom: fromLoanDateSearch,
            searchLoanDateTo: toLoanDateSearch,
            searchMaturityDateFrom: fromMaturityDateSearch,
            searchMaturityDateTo: toMaturityDateSearch,
        });
    };
    const clearForm = () => {
        setFromLoanDateSearch("");
        setToLoanDateSearch("");
        setFromMaturityDateSearch("");
        setToMaturityDateSearch("");
        setFormValue({
            searchLoanDateFrom: "",
            searchLoanDateTo: "",
            searchMaturityDateFrom: "",
            searchMaturityDateTo: "",
        });
    };
    const handleLoanDateSearch = (e) => {
        setFromLoanDateSearch(e.target.value?.toLocaleDateString());
    };
    const handleLoanToDateSearch = (e) => {
        setToLoanDateSearch(e.target.value?.toLocaleDateString());
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
        <div >
            <Meta title={"Loans"} />
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
                                <Calendar placeholder="Loan Date from" value={fromLoanDateSearch} className="mb-2 sm:w-full w-full" onChange={(e) => handleLoanDateSearch(e)} />

                                <Calendar placeholder="Loan Date to" className="sm:w-full w-full mb-3" value={toLoanDateSearch} onChange={(e) => handleLoanToDateSearch(e)} />
                            </div>

                            <div className="col-12 md:col-3 xl:col-3">
                                <Calendar placeholder="Maturity Date from" value={fromMaturityDateSearch} className="mb-2 sm:w-full w-full" onChange={(e) => handleMaturityDateSearch(e)} />
                                <Calendar placeholder="Maturity Date to" value={toMaturityDateSearch} className="sm:w-full w-full" onChange={(e) => handleMaturityToDateSearch(e)} />
                            </div>
                            <div className="col-12 md:col-2 xl:col-3 flex flex-column">
                                <div className="xl:ml-5">
                                <Button type="submit" style={{marginTop:"3px" ,height: "2rem", display: "flex", justifyContent: "center" }} className="mb-4  w-full md:w-8rem">
                                    Submit
                                </Button>
                                </div>
                                <div className="xl:ml-5">
                                <Button onClick={clearForm} style={{ height: "2rem", background: "red", display: "flex", justifyContent: "center" }} className="w-full md:w-8rem">
                                    Clear
                                </Button>
                                </div>
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
                    ) : (
                        <DataTable
                            ref={dt}
                            value={loans}
                            lazy
                            dataKey="id"
                            paginator
                            rows={10}
                            onPage={onPage}
                            first={lazyState.first}
                            totalRecords={loan?.count}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} loans"
                            emptyMessage="No Loans are found."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="slug" header="Loan ID" body={slugBodyTemplate}></Column>
                            <Column field="kyc" header="Shareholders" body={firstnameBodyTemplate}></Column>
                            <Column field="kyc_id" header="KYC ID" body={kycIdBodyTemplate}></Column>
                            <Column field="amount" header="Amount" body={amountBodyTemplate}></Column>
                            <Column field="interest_type" header="Interest Type" body={interestTypeBodyTemplate}></Column>
                            <Column field="loan_date_on" header="Loan Date On" body={loan_openBodyTemplate}></Column>
                            <Column field="loan_closed_on" header="Loan Closed On" body={loan_closedBodyTemplate}></Column>
                            <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                            <Column field="status" header="Status" body={statusBodyTemplate}></Column>

                            <Column body={actionBodyTemplate}></Column>
                        </DataTable>
                    )}

                    <Dialog visible={loanDialog} style={{ width: "500px" }} header="Loans" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="field">
                                <label htmlFor="shareholder">Shareholder</label>
                                <Dropdown
                                    value={formik.values.kyc}
                                    name="shareholder"
                                    id="shareholder"
                                    filter
                                    filterBy="slug,first_name"
                                    onChange={formik.handleChange("kyc")}
                                    options={kycs}
                                    valueTemplate={selectedShareholderTemplate}
                                    itemTemplate={shareholderOptionTemplate}
                                    optionLabel="pan"
                                    optionValue="id"
                                    placeholder="Select Shareholder"
                                    style={{ height: "40px" }}
                                    className={formik.touched.kyc && formik.errors.kyc && "p-invalid"}
                                />
                                {formik.errors.shareholder && formik.touched.shareholder && <p className="error">{formik.errors.shareholder}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between">
                                <div className="field">
                                    <label htmlFor="amount">Amount</label>
                                    <br />
                                    <InputNumber value={formik.values.amount} className={`w-full md:w-15rem ${formik.touched.amount && formik.errors.amount && "p-invalid"}`} name="amount" id="amount" onChange={handleAmountChange} />
                                    {formik.errors.amount && formik.touched.amount && <p className="error">{formik.errors.amount}</p>}
                                </div>
                                <div className="field">
                                    <label htmlFor="interest_type">Interest Type</label>
                                    <Dropdown
                                        value={formik.values.interest_type || ""}
                                        className={`w-full md:w-15rem ${formik.touched.interest_type && formik.errors.interest_type && "p-invalid"}`}
                                        name="interest_type"
                                        onChange={formik.handleChange("interest_type")}
                                        options={loanchoice}
                                        optionLabel="name"
                                        placeholder="Interest type"
                                        style={{ height: "40px" }}
                                    />
                                    {formik.errors.interest_type && formik.touched.interest_type && <p className="error">{formik.errors.interest_type}</p>}
                                </div>
                            </div>
                            {formik.values.interest_type && formik.values.interest_type === "EMI" && (
                                <div className="field">
                                    <label htmlFor="emi_period">EMI Period</label>
                                    <Dropdown
                                        value={formik.values.emi_period || ""}
                                        className={formik.touched.emi_period && formik.errors.emi_period && "p-invalid"}
                                        name="emi_period"
                                        onChange={formik.handleChange("emi_period")}
                                        options={emiperiodchoice}
                                        optionLabel="name"
                                        placeholder="Select Period"
                                        style={{ height: "40px" }}
                                    />
                                    {formik.errors.emi_period && formik.touched.emi_period && !formik.errors.interest_type && <p className="error">{formik.errors.emi_period}</p>}
                                </div>
                            )}

                            <div className="field">
                                <label htmlFor="roi">Rate Of Interest</label>
                                <InputNumber locale="en-IN" minFractionDigits={2} maxFractionDigits={4} className={formik.touched.roi && formik.errors.roi && "p-invalid"} value={formik.values.roi} name="roi" onChange={handleRoiChange} id="roi" />
                                {formik.errors.roi && formik.touched.roi && <p className="error">{formik.errors.roi}</p>}
                            </div>
                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">
                                    <label htmlFor="loan_date_on">Loan Date On</label>
                                    <Calendar
                                        value={formik.values.id && new Date(formik.values.loan_date_on)}
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        readOnlyInput
                                        name="loan_date_on"
                                        showTime
                                        hourFormat="24"
                                        className={`w-full md:w-15rem ${formik.touched.loan_date_on && formik.errors.loan_date_on && "p-invalid"}`}
                                        onChange={formik.handleChange("loan_date_on")}
                                    />
                                    {formik.errors.loan_date_on && formik.touched.loan_date_on && <p className="error">{formik.errors.loan_date_on}</p>}
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
                            <LoanDialogFooter />
                        </form>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Loan);
