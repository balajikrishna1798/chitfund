import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useGetKycQuery, useGetShareQuery } from "../service/Api";
import { useGetShareholderQuery, useUpdateShareholderMutation, useAddShareholderMutation,useGetSharesQuery } from "../service/Api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Tag } from 'primereact/tag';
import { slugBodyTemplate } from "../components/SlugBodyTemplate";

const Shareholder = () => {

    const [addShareholder] = useAddShareholderMutation();
    const [shareholders, setShareholders] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [shares, setShares] = useState(null);
    const [shareDialog, setShareDialog] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: kyc_id } = useGetKycQuery();
    const { data: share_id } = useGetShareQuery();

    const { data: getShareholder } = useGetShareholderQuery();
    const [updateShareholder] = useUpdateShareholderMutation();


    useEffect(() => {
        setKycs(kyc_id);
        setShares(share_id);
    }, [kyc_id]);

    useEffect(() => {
        setShares(share_id);
    }, [share_id]);

    useEffect(() => {
        setShareholders(getShareholder);
    }, [getShareholder]);

    const shareTypeSchema = Yup.object().shape({
        kyc: Yup.number().required("This Field is Required"),
        share_type: Yup.string().required("This Field is Required"),
        number_of_shares: Yup.number()
            .required("This Field is Required")
            .moreThan(0, "Should be greater than Zero")
            .integer(),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            share_type: null,
            number_of_shares: null,
            starting_share: null,
            ending_share: null,
        },
        validationSchema: shareTypeSchema,
        onSubmit: async (values) => {
            let _deposits = [...shareholders];
            let _deposit = { ...values };
            const {id, kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share } = values;

            if (values.id) {
                const index = findIndexById(values.id);
                _deposits[index] = _deposit;
                updateShareholder({ id, kyc, share_type, amount, interest_type, number_of_shares, starting_share, ending_share }).unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Shareholder details Updated", life: 3000 }))
                .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));;

            } else {
                addShareholder({ kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share }).unwrap()
                .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Shareholder details Created", life: 3000 }))
                .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));;
            }
            setShareholders(_deposits);
            setShareDialog(false);
        },
    });

    const openNew = () => {
        setShareDialog(true);
        formik.resetForm();
    };

    const hideDialog = () => {
        setShareDialog(false);
    };

    const editProduct = (shareholder) => {
        formik.setValues({ ...shareholder });
        setShareDialog(true);
    };
    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < shareholders.length; i++) {
            if (shareholders[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };


    const exportCSV = () => {
        dt.current.exportCSV();
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

    const codeBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.kyc_detail.first_name}-<span style={{ color: "green", fontWeight: "bold" }}>{rowData.kyc_detail.pan}</span>
            </>
        );
    };

    const shareBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.share_detail.share_type} ({rowData.share_detail.share_value})
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProduct(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">ShareHolders</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const ShareDialogFooter = () => (
        <p className="p-dialog-footer mt-4">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </p>
    );


    const ShareTypeDropdownTemplate = (option) => {
        console.log("option", option);
        return (
            <div className="flex align-items-center">
                <div>{option.share_type}</div>
                <div> - {option.slug}</div>
            </div>
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

     const numberofshareBodyTemplate = (rowData) => {
        console.log(rowData);
         return (
             <>
                 <span className="p-column-title"> Amount</span>
                 {rowData.number_of_shares}
             </>
         );
     };


     const startingshareBodyTemplate = (rowData) => {
        console.log(rowData);
         return (
             <>
                 <span className="p-column-title"> Amount</span>
                 {rowData.starting_share}
             </>
         );
     };
     const endingshareBodyTemplate = (rowData) => {
        console.log(rowData);
         return (
             <>
                 <span className="p-column-title"> Amount</span>
                 {rowData.ending_share}
             </>
         );
     };
    const selectedShareTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.share_type}</div>
                    <div> ({option.slug})</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const displayKycTemplate = (option) => {
        console.log("option", option);
        return (
            <div className="flex align-items-center">
                <div>{option.first_name}</div>
                <div> - {option.pan}</div>
            </div>
        );
    };

    const selectedKycTemplate = (option, props) => {
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
                        value={shareholders}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} shareholders"
                        globalFilter={globalFilter}
                        emptyMessage="No shareholders are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="shareholder_id" header="Shareholder ID" sortable body={slugBodyTemplate}></Column>
                        <Column field="kyc" header="KYC" sortable body={codeBodyTemplate}></Column>
                        <Column field="share_type" header="Share Type" sortable body={shareBodyTemplate}></Column>
                        <Column field="number_of_shares" header="Number of  Shares" sortable body={numberofshareBodyTemplate}></Column>

                        <Column field="starting_share" header="Starting Share" sortable body={startingshareBodyTemplate}></Column>
                        <Column field="ending_share" header="Ending Share" sortable body={endingshareBodyTemplate}></Column>

                        <Column field="created_at" header="Created On" sortable body={created_atBodyTemplate}></Column>
                        <Column field="status" header="Status" sortable body={statusBodyTemplate}></Column>

                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={shareDialog} style={{ width: "450px" }} header="Shareholders" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="grid formgrid">
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="kyc">KYC</label>
                                    <Dropdown
                                        value={formik.values.kyc}
                                        name="kyc"
                                        id="kyc"
                                        onChange={formik.handleChange("kyc")}
                                        options={kycs}
                                        valueTemplate={selectedKycTemplate}
                                        itemTemplate={displayKycTemplate}
                                        optionLabel="pan"
                                        optionValue="id"
                                        placeholder="Select User"
                                        className={`${formik.touched.kyc && formik.errors.kyc && "p-invalid"}`}
                                    />
                                    {formik.errors.kyc && formik.touched.kyc && <p className="error">{formik.errors.kyc}</p>}
                                </div>

                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="share_type">Share Type</label>
                                    <Dropdown
                                        value={formik.values.share_type}
                                        name="share_type"
                                        id="share_type"
                                        onChange={formik.handleChange("share_type")}
                                        options={shares}
                                        valueTemplate={selectedShareTemplate}
                                        itemTemplate={ShareTypeDropdownTemplate}
                                        optionLabel="share_type"
                                        optionValue="id"
                                        placeholder="Select Sharetype"
                                        className={`${formik.touched.share_type && formik.errors.share_type && "p-invalid"}`}
                                    />
                                    {formik.errors.share_type && formik.touched.share_type && <p className="error">{formik.errors.share_type}</p>}
                                </div>
                            </div>
                            <div className="grid formgrid mt-2">
                                <div className="field col-12 mb-2 lg:col-12 lg:mb-0">
                                    <label htmlFor="number_of_shares">Number of shares</label>
                                    <InputText
                                        value={formik.values.number_of_shares || ""}
                                        step="5"
                                        className={`${formik.touched.number_of_shares && formik.errors.number_of_shares && "p-invalid"}`}
                                        disabled={formik.values.id?true:false}
                                        name="number_of_shares"
                                        id="number_of_shares"
                                        type="number"
                                        onChange={formik.handleChange("number_of_shares")}
                                    />
                                    {formik.errors.number_of_shares && formik.touched.number_of_shares && <p className="error">{formik.errors.number_of_shares}</p>}
                                </div>
                            </div>
                            <ShareDialogFooter />
                        </form>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Shareholder);
