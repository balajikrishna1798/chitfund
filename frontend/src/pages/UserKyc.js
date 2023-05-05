import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Toolbar } from "primereact/toolbar";
import { country_state_data } from "../assets/country_state_data/country_state_data";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useAddKycMutation, useCheckKycMutation, useGetKycQuery, useUpdateKycMutation, useDeleteKycMutation } from "../service/Api";
import { Dropdown } from "primereact/dropdown";

const initialState = {
    id: null,
    pan: null,
    mobile_number: null,
    address: null,
    first_name: null,
    last_name: null,
    email: null,
    city: null,
    country: null,
    state: null,
};

const UserKyc = () => {
    const [countryid, setCountryid] = useState(null);
    const [country, setCountry] = useState("");
    const [states, setStates] = useState([]);
    const [state, setState] = useState(null);
    const [stateid, setStateid] = useState(null);
    const [addKyc] = useAddKycMutation();
    const [kycs, setKycs] = useState(null);
    const [kycDialog, setKycDialog] = useState(false);
    const [deleteKycDialog, setDeleteKycDialog] = useState(false);
    const [deleteKycsDialog, setDeleteKycsDialog] = useState(false);
    const [kyc, setKyc] = useState(initialState);
    const [selectedKycs, setSelectedKycs] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data } = useGetKycQuery();
    const [deleteKyc] = useDeleteKycMutation();
    const [updateKyc] = useUpdateKycMutation();
    const [checkKyc] = useCheckKycMutation();
    const [isPanError, setIsPanError] = useState(null);
    const [isMobileError, setIsMobileError] = useState(null);

    const onPanHandleChange = async (event) => {
        formik.setFieldValue("pan", event.target.value);
        if (event.target.value.length > 5) {
            await checkKyc({ pan: event.target.value })
                .unwrap()
                .then((payload) => {
                    setIsPanError(null);
                })
                .catch((error) => error.data.pan_error && setIsPanError(error.data.pan_error));
        }
    };

    const onMobileHandleChange = async (event) => {
        formik.setFieldValue("mobile_number", event.target.value);
        if (event.target.value.length > 5) {
            await checkKyc({ mobile_number: event.target.value })
                .unwrap()
                .then((payload) => {
                    setIsMobileError(null);
                })
                .catch((error) => error.data.mobile_error && setIsMobileError(error.data.mobile_error));
        }
    };

    useEffect(() => {
        setKycs(data);
    }, [data]);

    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

    const kycSchema = Yup.object().shape({
        first_name: Yup.string().required("This Field is Required").min(4).max(30),
        last_name: Yup.string().required("This Field is Required").min(4).max(30),
        address: Yup.string().required("This Field is Required").min(2).max(100),
        mobile_number: Yup.string().required("This Field is Required").matches(phoneRegExp, "Phone number is not valid").min(10),
        pan: Yup.string().required("This Field is required").min(10).max(10),
        country: Yup.string().required("This Field is Required"),
        state: Yup.string().required("This Field is Required"),
        city: Yup.string().required("This Field is Required"),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            pan: null,
            mobile_number: null,
            address: null,
            first_name: null,
            last_name: null,
            email: null,
            country: null,
            state: null,
            city: null,
        },

        validationSchema: kycSchema,
        onSubmit: async (values) => {
            if (!isPanError && !isMobileError) {
                const { pan, mobile_number, country, state, address, email, city, first_name, last_name } = values;
                let _kycs = [...kycs];
                let _kyc = { ...kyc };
                if (kyc.id) {
                    const index = findIndexById(kyc.id);
                    _kycs[index] = _kyc;
                    await updateKyc({ id: kyc.id, first_name, last_name, mobile_number, country, state, pan, city, email, address })
                        .unwrap()
                        .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Kyc Updated", life: 3000 }))
                        .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                        setKycDialog(false);

                    } else {
                    addKyc({ first_name, last_name, country, state, pan, mobile_number, city, email, address })
                        .unwrap()
                        .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "User Kyc Created", life: 3000 }))
                        .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                        setKycDialog(false);

                    }
                setKycs(_kycs);
                setKyc(_kyc);
            }
        },
    });

    const handlecounty = (e) => {
        const getcountryId = e.target.value;
        const getStatedata = country_state_data.find((country) => country.country_id === getcountryId.country_id).states;
        setStates(getStatedata);
        setCountryid(getcountryId);
        setCountry(getcountryId.country_name);
        formik.setFieldValue("country", getcountryId.country_name);
    };

    const handlestate = (e) => {
        const getstateid = e.target.value;
        console.log(getstateid);
        setStateid(getstateid);
        setState(getstateid.state_name);
        formik.setFieldValue("state", getstateid.state_name);
    };

    const openNew = () => {
        formik.resetForm();
        setKyc(initialState);
        formik.setValues({ ...initialState });
        setKycDialog(true);
    };

    const hideDialog = () => {
        setKycDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteKycDialog(false);
    };

    const hideDeleteKycsDialog = () => {
        setDeleteKycsDialog(false);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < kycs.length; i++) {
            if (kycs[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const editProduct = (kyc) => {
        formik.resetForm();
        setKyc({ ...kyc });
        formik.setValues({ ...kyc });
        setKycDialog(true);
    };

    const confirmDeleteProduct = (kyc) => {
        setKyc(kyc);
        setDeleteKycDialog(true);
    };

    const deleteKycField = () => {
        let share = kycs.filter((val) => val.id !== kyc.id);
        deleteKyc(kyc.id);
        setKycs(share);
        setDeleteKycDialog(false);
        setKyc({});
        toast.current.show({ severity: "success", summary: "Successful", detail: "kyc Deleted", life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteKycsDialog(true);
    };

    const deleteSelectedKycs = async () => {
        let _shares = kycs.filter((val) => !selectedKycs.includes(val));
        console.log(selectedKycs, "selectedKycs");
        await selectedKycs.map((a) => {
            deleteKyc(a.id);
        });

        setKycs(_shares);
        setDeleteKycsDialog(false);
        setSelectedKycs(null);
        toast.current.show({ severity: "success", summary: "Successful", detail: "Products Deleted", life: 3000 });
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedKycs || !selectedKycs.length} />
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

    const firstNameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.first_name}
            </>
        );
    };

    const lastNameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.last_name}
            </>
        );
    };

    const panBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.pan}
            </>
        );
    };
    const phoneBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.mobile_number}
            </>
        );
    };

    const emailBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.email}
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
            <h5 className="m-0">KYC</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const ProductKycFooter = () => (
        <p className="p-dialog-footer">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteKycField} />
        </>
    );
    const deleteKycsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteKycsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedKycs} />
        </>
    );

    const isFormFieldInvalid = (name) => {
        console.log("nameeee", name, formik.touched, formik.errors);
        return !!(formik.touched[name] && formik.errors[name]);
    };

    const getFormErrorMessage = (name) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={kycs}
                        selection={selectedKycs}
                        onSelectionChange={(e) => setSelectedKycs(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kycs"
                        globalFilter={globalFilter}
                        emptyMessage="No users found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                        <Column field="first_name" header="First Name" sortable body={firstNameBodyTemplate}></Column>
                        <Column field="last_name" header="Last Name" sortable body={lastNameBodyTemplate}></Column>
                        <Column field="pan" header="PAN" sortable body={panBodyTemplate}></Column>
                        <Column field="address" header="Mobile Number" sortable body={phoneBodyTemplate}></Column>
                        <Column field="email" header="Email" sortable body={emailBodyTemplate}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={kycDialog} style={{ width: "500px" }} header="Kyc Details" modal className="p-fluid" onHide={hideDialog}>
                        {/* <label htmlFor="personal_details">User Personal Details</label> */}
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2"
                        autoComplete="off"
                        >
                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">


                                    <InputText className={`w-full md:w-15rem ${formik.touched.first_name && formik.errors.first_name && "p-invalid"}`} value={formik.values.first_name || ""} id="first_name" type="text" name="first_name"
                                    placeholder="First Name"
                                    onChange={formik.handleChange("first_name")} />

                                    {formik.touched.first_name && formik.errors.first_name && <p className="error">{formik.errors.first_name}</p>}
                                </div>
                                <div className="field">


                                    <InputText className={`w-full md:w-15rem ${formik.touched.last_name && formik.errors.last_name && "p-invalid"}`} value={formik.values.last_name || ""} id="last_name"
                                     placeholder="Last Name"
                                    type="text" name="last_name" onChange={formik.handleChange("last_name")} />

                                    {formik.touched.last_name && formik.errors.last_name && <p className="error">{formik.errors.last_name}</p>}
                                </div>
                            </div>

                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">

                                    <InputText
                                        className={`w-full md:w-15rem ${formik.touched.pan && formik.errors.pan && "p-invalid"}`}
                                        value={formik?.values?.pan || ""}
                                        id="pan"
                                        name="pan"
                                        type="text"
                                        placeholder="PAN"
                                        onChange={(e) => {
                                            onPanHandleChange(e);
                                        }}
                                    />

                                    {((formik.touched.pan && formik.errors.pan) || isPanError) && <p className="error">{formik?.errors?.pan || isPanError}</p>}
                                </div>
                                <div className="field" style={{ marginLeft: "22px" }}>

                                    <InputText className={`w-full md:w-15rem ${formik.touched.mobile_number && formik.errors.mobile_number && "p-invalid"}`} value={formik.values.mobile_number || ""}
                                    placeholder="Mobile Number"
                                    id="mobile_number" name="mobile_number" type="text" onChange={(e) => onMobileHandleChange(e)} />

                                    {((formik.touched.mobile_number && formik.errors.mobile_number) || isMobileError) && <p className="error">{formik?.errors?.mobile_number || isMobileError}</p>}
                                </div>
                            </div>
                            <div>

                                <InputText
                                placeholder="Email Address"
                                value={formik.values.email || ""} id="email" name="email" type="text" onChange={formik.handleChange("email")} />

                                <div>
                                    <h5 htmlFor="share_type" className="mt-3" style={{fontWeight:600}}>Residential Address</h5>
                                    <div className="flex flex-column md:flex-row justify-content-between">
                                <div className="field">
                                            <Dropdown
                                                inputId="country"
                                                name="country_id"
                                                value={countryid}
                                                options={country_state_data}
                                                optionLabel="country_name"
                                                placeholder="Country"
                                                className={`w-full md:w-10rem ${formik.touched.country && formik.errors.country && "p-invalid"}`}
                                                onChange={(e) => {
                                                    handlecounty(e);
                                                }}
                                            />
                                            {formik.touched.country && formik.errors.country && <p className="error">{formik.errors.country}</p>}
                                        </div>

                                        <div className="field">
                                            <Dropdown value={stateid} onChange={(e) => handlestate(e)} options={states}

                                            optionLabel="state_name" placeholder="State" style={{ height: "40px" }} className={`w-full md:w-10rem ${formik.touched.state && formik.errors.state && "p-invalid"}`} />
                                            {formik.touched.state && formik.errors.state && <p className="error">{formik.errors.state}</p>}
                                            </div>

                                            <div className="field">

                                        <InputText className={`w-full md:w-10rem ${formik.touched.city && formik.errors.city && "p-invalid"}`} value={formik.values.city || ""}
                                        placeholder="City"
                                        id="city" name="city" type="text" onChange={formik.handleChange("city")} />

                                        {formik.touched.city && formik.errors.city && <p className="error">{formik.errors.city}</p>}
                                    </div>
                                    </div>
                                    <InputTextarea
                                        style={{ marginTop: "10px", marginBottom: "10px" }}
                                        className={formik.touched.address && formik.errors.address && "p-invalid"}
                                        value={formik.values.address || ""}
                                        name="address"
                                        placeholder="Permanent Address"
                                        rows={5}
                                        cols={30}
                                        onChange={formik.handleChange("address")}
                                    />
                                    {formik.touched.address && formik.errors.address && <p className="error">{formik.errors.address}</p>}
                                </div>
                            </div>
                            {<ProductKycFooter />}
                        </form>
                    </Dialog>

                    <Dialog visible={deleteKycDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {kyc && (
                                <span>
                                    Are you sure you want to delete <b>{kyc.share_value}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteKycsDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteKycsDialogFooter} onHide={hideDeleteKycsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {kyc && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserKyc);
