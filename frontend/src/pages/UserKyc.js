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
import { useAddKycMutation, useCheckKycMutation, useGetKycQuery, useUpdateKycMutation } from "../service/KycApi";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { slugBodyTemplate } from "../components/SlugBodyTemplate";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";
import Meta from "../components/Meta";

const UserKyc = () => {
    const [states, setStates] = useState([]);
    const [addKyc] = useAddKycMutation();
    const [kycs, setKycs] = useState(null);
    const [kycDialog, setKycDialog] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);
    const [updateKyc] = useUpdateKycMutation();
    const [checkKyc] = useCheckKycMutation();
    const [isPanError, setIsPanError] = useState(null);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [search, setSearchFirstName] = useState("");
    const { data, isLoading } = useGetKycQuery({ page: lazyState.page, search: search });
    const navigate = useNavigate();

    useEffect(() => {
        setKycs(data && data.results);
    }, [data]);

    const onPage = (event) => {
        setlazyState(event);
    };

    const onFirstNameHandleChange = async (event) => {
        let firstName = await event.target.value;
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        await formik.setFieldValue("first_name", firstName);
    };

    const onLastNameHandleChange = async (event) => {
        let lastName = await event.target.value;
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        await formik.setFieldValue("last_name", lastName);
    };

    const onCityHandleChange = async (event) => {
        let city = await event.target.value;
        city = city.charAt(0).toUpperCase() + city.slice(1);
        await formik.setFieldValue("city", city);
    };

    const onPanHandleChange = async (event) => {
        const pan = await event.target.value.toUpperCase();
        await formik.setFieldValue("pan", pan);
        if (event.target.value.length > 5) {
            await checkKyc({ pan: event.target.value })
                .unwrap()
                .then((payload) => {
                    setIsPanError(null);
                })
                .catch((error) => error.data.pan_error && setIsPanError(error.data.pan_error));
        }
    };

    const getDataByCountryName = (country) => {
        return country_state_data.find((data) => data.country_name.toLowerCase() === country.toLowerCase());
    };

    const getDataByStateName = (country, state) => {
        return getDataByCountryName(country).states.find((data) => data.value.toLowerCase() === state.toLowerCase()).value;
    };
    const statusBodyTemplate = (product) => {
        return <Tag style={{ width: 50, height: 30 }} value={`${product.active === true ? "Active" : "InActive"}`} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        switch (product.active) {
            case true:
                return "success";

            case false:
                return "warning";

            default:
                return null;
        }
    };

    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

    var regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;

    const kycSchema = Yup.object().shape({
        first_name: Yup.string().required("This Field is Required").min(4, "First Name should be more than 4 characters").max(30, "First Name shouldnot be more than 30 characters"),
        last_name: Yup.string().required("This Field is Required").max(30, "Last Name should be more than 30 characters"),
        address: Yup.string().required("This Field is Required").min(10, "Address should be atleast 10 Characters").max(100),
        email: Yup.string().email("Please provide valid email address"),
        mobile_number: Yup.string().required("This Field is Required").matches(phoneRegExp, "Phone number is not valid").min(10, "Mobile number should be more than 10"),
        pan: Yup.string().required("This Field is required").min(10, "Pan Number should be 10 Characters").max(10, "Pan Number should be only 10 Characters").matches(regpan, "Pan Number is not valid"),
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
            email: "",
            city: null,
            country_id: getDataByCountryName("india"),
            state_id: getDataByStateName("india", "tamil nadu"),
        },

        validationSchema: kycSchema,
        onSubmit: async (values) => {
            console.log(values);
            if (!isPanError) {
                const { id, pan, mobile_number, country_id, state_id, address, email, city, first_name, last_name } = values;
                const country = country_id.country_name;
                const state = state_id;
                let _kycs = [...kycs];
                let _kyc = { ...values };
                if (id) {
                    const index = findIndexById(id);
                    _kycs[index] = _kyc;
                    updateKyc({ id, first_name, last_name, mobile_number, country, state, pan, city, email, address })
                        .unwrap()
                        .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Kyc Updated", life: 3000 }))
                        .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                    setKycDialog(false);
                } else {
                    addKyc({ first_name, last_name, country, state, pan: pan.toUpperCase(), mobile_number, city, email, address })
                        .unwrap()
                        .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "User Kyc Created", life: 3000 }))
                        .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                    setKycDialog(false);
                }
                setKycs(_kycs);
                values(_kyc);
            }
        },
    });
    useEffect(() => {
        if (formik && !formik.values.id) {
            setStates(country_state_data.find((country) => country.country_id == 101).states);
        }
    }, [formik]);
    const handlecounty = (e) => {
        console.log(e.target.value);
        formik.setFieldValue("country_id", e.target.value);
        const getcountryId = e.target.value;
        const getStatedata = country_state_data.find((country) => country.country_id === getcountryId.country_id).states;
        setStates(getStatedata);
        formik.setFieldValue("country", getcountryId.country_name);
    };

    const handlestate = (e) => {
        formik.setFieldValue("state_id", e.target.value);
        const getstateid = e.target.value;
        console.log(getstateid);
        formik.setFieldValue("state", getstateid);
    };

    const openNew = () => {
        setIsPanError(null);
        formik.resetForm();
        setKycDialog(true);
    };

    const hideDialog = () => {
        setKycDialog(false);
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
        setIsPanError(null);
        formik.setValues({ ...kyc, country_id: getDataByCountryName(kyc.country), state_id: getDataByStateName(kyc.country, kyc.state) });
        setKycDialog(true);
    };

    const viewProduct = (kyc) => {
        formik.setValues({ ...kyc, country_id: getDataByCountryName(kyc.country), state_id: getDataByStateName(kyc.country, kyc.state) });
        navigate(`${kyc.id}`);
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

    const firstNameBodyTemplate = (rowData) => {
        console.log(rowData);
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-eye" style={{}} className="p-button-rounded p-button-primary mr-2" onClick={() => viewProduct(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">KYC</h5>
        </div>
    );

    const KycFooter = () => (
        <p className="p-dialog-footer">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );

    const onHandleSearchChange = (e) => {
        setSearchFirstName(e.target.value);
    };

    return (
        <div className="grid crud-demo">
            <Meta title={"KYCs"} />
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />

                    <InputText className="mb-5" value={search} id="first_name_search" type="text" name="first_name_search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />

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
                            lazy
                            value={kycs}
                            dataKey="id"
                            onPage={onPage}
                            paginator
                            rows={10}
                            scrollable
                            scrollHeight="400px"
                            first={lazyState.first}
                            totalRecords={data?.count}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kycs"
                            emptyMessage="No users found."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="slug" header="Kyc ID" body={slugBodyTemplate}></Column>

                            <Column field="first_name" header="First Name" body={firstNameBodyTemplate}></Column>
                            <Column field="last_name" header="Last Name" body={lastNameBodyTemplate}></Column>
                            <Column field="pan" header="PAN" body={panBodyTemplate}></Column>
                            <Column field="address" header="Mobile Number" body={phoneBodyTemplate}></Column>
                            <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                            <Column field="status" header="Status" body={statusBodyTemplate}></Column>
                            <Column body={actionBodyTemplate}></Column>
                        </DataTable>
                    )}

                    <Dialog visible={kycDialog} style={{ width: "500px" }} header="Kyc Details" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2" autoComplete="off">
                            <div className="flex flex-column md:flex-row justify-content-between ">
                                <div className="field">
                                    <InputText
                                        className={`w-full md:w-15rem ${formik.touched.first_name && formik.errors.first_name && "p-invalid"}`}
                                        value={formik.values.first_name || ""}
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        placeholder="First Name"
                                        onChange={(e) => onFirstNameHandleChange(e)}
                                    />

                                    {formik.touched.first_name && formik.errors.first_name && <p className="error">{formik.errors.first_name}</p>}
                                </div>
                                <div className="field">
                                    <InputText
                                        className={`w-full md:w-15rem ${formik.touched.last_name && formik.errors.last_name && "p-invalid"}`}
                                        value={formik.values.last_name || ""}
                                        id="last_name"
                                        placeholder="Last Name"
                                        type="text"
                                        name="last_name"
                                        onChange={(e) => onLastNameHandleChange(e)}
                                    />

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
                                    <InputText
                                        className={`w-full md:w-15rem ${formik.touched.mobile_number && formik.errors.mobile_number && "p-invalid"}`}
                                        value={formik.values.mobile_number || ""}
                                        placeholder="Mobile Number"
                                        id="mobile_number"
                                        name="mobile_number"
                                        type="text"
                                        onChange={formik.handleChange("mobile_number")}
                                    />

                                    {formik.touched.mobile_number && formik.errors.mobile_number && <p className="error">{formik?.errors?.mobile_number}</p>}
                                </div>
                            </div>
                            <div>
                                <InputText placeholder="Email Address" value={formik.values.email || ""} id="email" name="email" type="text" onChange={formik.handleChange("email")} className={`${formik.touched.email && formik.errors.email && "p-invalid"}`} />
                                {formik.touched.email && formik.errors.email && <p className="error">{formik.errors.email}</p>}
                                <div>
                                    <h5 htmlFor="share_type" className="mt-3" style={{ fontWeight: 600 }}>
                                        Residential Address
                                    </h5>
                                    <div className="flex flex-column md:flex-row justify-content-between">
                                        <div className="field">
                                            <Dropdown
                                                inputId="country"
                                                name="country_id"
                                                value={formik.values.country_id}
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
                                            <Dropdown
                                                name="state_id"
                                                value={formik.values.state_id}
                                                onChange={(e) => handlestate(e)}
                                                options={states}
                                                optionLabel="value"
                                                placeholder="State"
                                                style={{ height: "40px" }}
                                                className={`w-full md:w-10rem ${formik.touched.state && formik.errors.state && "p-invalid"}`}
                                            />

                                            {formik.touched.state && formik.errors.state && <p className="error">{formik.errors.state}</p>}
                                        </div>

                                        <div className="field">
                                            <InputText className={`w-full md:w-10rem ${formik.touched.city && formik.errors.city && "p-invalid"}`} value={formik.values.city || ""} placeholder="City" id="city" name="city" type="text" onChange={onCityHandleChange} />

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
                            {<KycFooter />}
                        </form>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserKyc);
