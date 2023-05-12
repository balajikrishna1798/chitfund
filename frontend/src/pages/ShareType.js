import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useAddShareMutation, useGetShareQuery, useUpdateShareMutation, useDeleteShareMutation } from "../service/Api";
import { Dropdown } from "primereact/dropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import { slugBodyTemplate } from "../components/SlugBodyTemplate";

const ShareType = () => {
    const sharetypechoice = [
        { name: "Equity", value: "Equity" },
        { name: "Pref", value: "Pref" },
    ];

    const [addShare] = useAddShareMutation();
    const [shareTypes, setShareTypes] = useState(null);

    const [shareTypeDialog, setShareDialog] = useState(false);
    const [deleteShareTypeDialog, setDeleteProductDialog] = useState(false);
    const [deleteShareTypesDialog, setDeleteProductsDialog] = useState(false);
    const [selectedShareTypes, setSelectedShareTypes] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const { data, isLoading: loading } = useGetShareQuery(lazyState.page);
    const [deleteShare] = useDeleteShareMutation();
    const [updateShare] = useUpdateShareMutation();

    const onPage = (event) => {
        console.log("event", event);
        setlazyState(event);
    };

    useEffect(() => {
        setShareTypes(data && data.results);
    }, [data]);
    const shareTypeSchema = Yup.object().shape({
        share_value: Yup.number()
            .required("This Field is Required")
            .moreThan(0, "Should be greater than Zero")
            .test("maxDigitsAfterDecimal", "number field must have 4 digits after decimal or less", (number) => /^\d+(\.\d{1,4})?$/.test(number)),
        share_type: Yup.string().required("This Field is Required"),
    });

    const formik = useFormik({
        initialValues: {
            share_type: null,
            share_value: null,
        },
        validationSchema: shareTypeSchema,
        onSubmit: async (values) => {
            console.log(values, values);
            const { share_value, share_type } = values;
            let _shares = [...shareTypes];
            let _share = { ...formik.values };
            console.log(_share);
            if (formik.values.id) {
                const index = findIndexById(formik.values.id);
                _shares[index] = _share;
                updateShare({ id: formik.values.id, share_value, share_type })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "ShareType Updated", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                setShareDialog(false);
            } else {
                addShare({ share_value, share_type })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "ShareType Created", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
                setShareDialog(false);
            }
            setShareTypes(_shares);
        },
    });

    const openNew = () => {
        formik.resetForm();
        setShareDialog(true);
    };

    const hideDialog = () => {
        setShareDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteShareTypesDialog = () => {
        setDeleteProductsDialog(false);
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

    const editShareType = (share) => {
        formik.setValues({ ...share });
        setShareDialog(true);
    };
    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < shareTypes.length; i++) {
            if (shareTypes[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteShareType = (share) => {
        formik.setValues(share);
        setDeleteProductDialog(true);
    };

    const deleteShareType = () => {
        deleteShare(formik.values.id);
        setDeleteProductDialog(false);
        toast.current.show({ severity: "success", summary: "Successful", detail: "ShareType Deleted", life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedShareTypes = async () => {
        let _shares = shareTypes.filter((val) => !selectedShareTypes.includes(val));
        await selectedShareTypes.map((sharetype) => {
            deleteShare(sharetype.id);
        });

        setShareTypes(_shares);
        setDeleteProductsDialog(false);
        setSelectedShareTypes(null);
        toast.current.show({ severity: "success", summary: "Successful", detail: "Products Deleted", life: 3000 });
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedShareTypes || !selectedShareTypes.length} />
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

    const shareValueBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.share_value}
            </>
        );
    };

    const shareTypeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Share Type</span>
                {rowData.share_type}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editShareType(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteShareType(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">ShareTypes</h5>
            {/* <span className="block mt-2 md:mt-0 p-input-icon-left"> */}
                {/* <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." /> */}
            {/* </span> */}
        </div>
    );

    const ShareDialogFooter = () => (
        <div className="p-dialog-footer">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" type="submit" icon="pi pi-check" className="p-button-text" />
        </div>
    );
    const deleteShareTypeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteShareType} />
        </>
    );
    const deleteShareTypesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteShareTypesDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedShareTypes} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    {
                        <DataTable
                            ref={dt}
                            lazy
                            filterDisplay="row"
                            dataKey="id"
                            paginator
                            value={shareTypes}
                            first={lazyState.first}
                            rows={10}
                            totalRecords={data && data.count}
                            onPage={onPage}
                            sortField={lazyState.sortField}
                            sortOrder={lazyState.sortOrder}
                            loading={loading}
                            scrollable
                            scrollHeight="450px"
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} shareTypes"
                            globalFilter={globalFilter}
                            emptyMessage="No shareTypes found."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="slug" header="ShareType ID" sortable body={slugBodyTemplate}></Column>
                            <Column field="share_type" header="Share Type" sortable body={shareTypeBodyTemplate}></Column>
                            <Column field="share_value" header="Share Value" sortable body={shareValueBodyTemplate}></Column>
                            <Column field="created_at" header="Created On" sortable body={created_atBodyTemplate}></Column>
                            <Column body={actionBodyTemplate}></Column>
                        </DataTable>
                    }
                    <Dialog visible={shareTypeDialog} style={{ width: "450px" }} header="ShareTypes" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="field">
                                <label htmlFor="share_type">Share Type</label>
                                <Dropdown
                                    className={formik.touched.share_type && formik.errors.share_type && "p-invalid"}
                                    value={formik.values.share_type}
                                    name="share_type"
                                    onChange={formik.handleChange("share_type")}
                                    options={sharetypechoice}
                                    optionLabel="name"
                                    placeholder="Select Sharetype"
                                    style={{ height: "40px" }}
                                />
                                {formik.errors.share_type && formik.touched.share_type && <p className="error">{formik.errors.share_type}</p>}
                            </div>
                            <div className="field">
                                <label htmlFor="share_value">Share Value</label>
                                <InputText className={formik.touched.share_value && formik.errors.share_value && "p-invalid"} name="share_value" id="share_value" type="number" value={formik.values.share_value} step="10" onChange={formik.handleChange("share_value")} />
                                {formik.errors.share_value && formik.touched.share_value && <p className="error">{formik.errors.share_value}</p>}
                            </div>

                            {<ShareDialogFooter />}
                        </form>
                    </Dialog>

                    <Dialog visible={deleteShareTypeDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteShareTypeDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {formik.values && (
                                <span>
                                    Are you sure you want to delete <b>{formik.values.share_value}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteShareTypesDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteShareTypesDialogFooter} onHide={hideDeleteShareTypesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                            {formik.values && <span>Are you sure you want to delete the selected shareTypes?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ShareType);
