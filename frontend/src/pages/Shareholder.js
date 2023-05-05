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
import { useDeleteShareholderMutation, useGetShareholderQuery, useUpdateShareholderMutation, useAddShareholderMutation } from "../service/Api";
import { useFormik } from "formik";
import * as Yup from "yup";

const Shareholder = () => {
    const depositchoice = [
        { name: "EMI", value: "EMI" },
        { name: "Interest", value: "Interest" },
    ];
    const initialState = {
        id: null,
        kyc: null,
        share_type: null,
        interest_type: null,
        number_of_shares: null,
        starting_share: null,
        ending_share: null,
        deposited_on: null,
        withdrawn_on: null,
    };
    const [addShareholder] = useAddShareholderMutation();
    const [shareholders, setShareholders] = useState(null);
    const [kycs, setKycs] = useState(null);
    const [shares, setShares] = useState(null);
    const [shareDialog, setShareDialog] = useState(false);
    const [deleteShareDialog, setDeleteProductDialog] = useState(false);
    const [deleteSharesDialog, setDeleteProductsDialog] = useState(false);
    const [shareholder, setShareholder] = useState(initialState);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: kyc_id } = useGetKycQuery();
    const { data: share_id } = useGetShareQuery();
    const { data: getShareholder } = useGetShareholderQuery();
    const [deleteShareholder] = useDeleteShareholderMutation();
    const [updateShareholder] = useUpdateShareholderMutation();
    const { kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share, deposited_on, withdrawn_on } = shareholder;

    useEffect(() => {
        setKycs(kyc_id);
        console.log(kyc_id);
        setShares(share_id);
    }, [kyc_id]);

    useEffect(() => {
        console.log(share_id);
        setShares(share_id);
    }, [share_id]);

    useEffect(() => {
        setShareholders(getShareholder);
    }, [getShareholder]);

    const shareTypeSchema = Yup.object().shape({
        kyc: Yup.number().required("This Field is Required"),
        share_type: Yup.string().required("This Field is Required"),
        interest_type: Yup.string().required("This Field is Required"),
        number_of_shares: Yup.number().required("This Field is Required").moreThan(0, "Should be greater than Zero"),
        starting_share: Yup.number().required("This Field is Required").moreThan(0, "Should be greater than Zero"),
        ending_share: Yup.number().required("This Field is Required").moreThan(0, "Should be greater than Zero"),
    });

    const formik = useFormik({
        initialValues: {
            id: null,
            kyc: null,
            share_type: null,
            amount: null,
            interest_type: null,
            number_of_shares: null,
            starting_share: null,
            ending_share: null,
        },
        validationSchema: shareTypeSchema,
        onSubmit: async (values) => {
            let _deposits = [...shareholders];
            let _deposit = { ...shareholder };
            const { kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share } = values;

            if (shareholder.id) {
                console.log(_deposit);
                const index = findIndexById(shareholder.id);
                _deposits[index] = _deposit;
                await updateShareholder({ id: shareholder.id, kyc, share_type, amount, interest_type, number_of_shares, starting_share, ending_share });
                toast.current.show({ severity: "success", summary: "Successful", detail: "Product Updated", life: 3000 });
            } else {
                console.log(shareholders);
                await addShareholder({ kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share });
                toast.current.show({ severity: "success", summary: "Successful", detail: "Product Created", life: 3000 });
            }

            setShareholders(_deposits);
            setShareDialog(false);
            setShareholder(_deposit);
        },
    });

    const openNew = () => {
        setShareholder(initialState);
        setShareDialog(true);
        formik.resetForm()
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

    const saveProduct = async () => {};

    const editProduct = (shareholder) => {
        console.log(kyc, "kyc");
        console.log(shareholder, "shareholder");
        setShareholder({ ...shareholder });
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
    const confirmDeleteProduct = (shareholder) => {
        setShareholder(shareholder);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        deleteShareholder(shareholder.id);
        setDeleteProductDialog(false);
        setShareholder({});
        toast.current.show({ severity: "success", summary: "Successful", detail: "Product Deleted", life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = async () => {
        let _deposits = shareholders.filter((val) => !selectedProducts.includes(val));
        await selectedProducts.map((a) => {
            deleteShareholder(a.id);
        });

        setShareholders(_deposits);
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
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteProduct(rowData)} />
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

    const countryShareTemplate = (option) => {
        console.log("option", option);
        return (
            <div className="flex align-items-center">
                <div>{option.share_type}</div>
                <div> ({option.share_value})</div>
            </div>
        );
    };

    const selectedShareTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.share_type}</div>
                    <div> ({option.share_value})</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryKycTemplate = (option) => {
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
                        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                        <Column field="kyc" header="KYC" sortable body={codeBodyTemplate}></Column>
                        <Column field="share_type" header="Share Type" sortable body={shareBodyTemplate}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={shareDialog} style={{ width: "450px" }} header="Shareholders" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                        <div className="grid formgrid">
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="kyc">
                                        KYC
                                    </label>
                                    <Dropdown
                                        value={formik.values.kyc}
                                        name="kyc"
                                        id="kyc"
                                        onChange={formik.handleChange("kyc")}
                                        options={kycs}
                                        valueTemplate={selectedKycTemplate}
                                        itemTemplate={countryKycTemplate}
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
                                        itemTemplate={countryShareTemplate}
                                        optionLabel="share_type"
                                        optionValue="id"
                                        placeholder="Select Sharetype"
                                        className={`${formik.touched.share_type && formik.errors.share_type && "p-invalid"}`}
                                    />
                                    {formik.errors.share_type && formik.touched.share_type && <p className="error">{formik.errors.share_type}</p>}
                                </div>
                            </div>
                            <div className="grid formgrid mt-2 justify-content-center">
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">

                                <label htmlFor="number_of_shares">Number of shares</label>
                                <InputText
                                    value={formik.values.number_of_shares || 0}
                                    className={`w-full ${formik.touched.number_of_shares && formik.errors.number_of_shares && "p-invalid"}`}
                                    name="number_of_shares"
                                    id="number_of_shares"
                                    type="number"
                                    onChange={formik.handleChange("number_of_shares")}
                                />
                                {formik.errors.number_of_shares && formik.touched.number_of_shares && (
                                    <p className="error">
                                        {formik.errors.number_of_shares}
                                    </p>
                                )}
                            </div>

</div>
                            <div className="grid formgrid mt-2">
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="starting_share">Starting Share</label>
                                    <InputText
                                        value={formik.values.starting_share || 0}
                                        className={`${formik.touched.starting_share && formik.errors.starting_share && "p-invalid"}`}
                                        name="starting_share"
                                        id="starting_share"
                                        type="number"
                                        onChange={formik.handleChange("starting_share")}
                                    />
                                    {formik.errors.starting_share && formik.touched.starting_share && <p className="error">{formik.errors.starting_share}</p>}
                                </div>
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="ending_share">
                                        Ending Share
                                    </label>
                                    <InputText
                                        value={formik.values.ending_share || 0}
                                        name="ending_share"
                                        className={`${formik.touched.ending_share && formik.errors.ending_share && "p-invalid"}`}
                                        id="ending_share"
                                        type="number"
                                        onChange={formik.handleChange("ending_share")}
                                    />
                                    {formik.errors.ending_share && formik.touched.ending_share && <p className="error ml-5">{formik.errors.ending_share}</p>}
                                </div>
                            </div>
                            <ShareDialogFooter/>
                        </form>
                    </Dialog>

                    <Dialog visible={deleteShareDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteShareDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {shareholder && (
                                <span>
                                    Are you sure you want to delete <b>{shareholder.share_value}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSharesDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteSharesDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {shareholder && <span>Are you sure you want to delete the selected shares?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Shareholder);
