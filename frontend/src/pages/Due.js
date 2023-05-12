import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { useGetDueQuery} from "../service/Api";
import { Tag } from 'primereact/tag';


const Due = () => {
    const [dues, setDues] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: getDue } = useGetDueQuery();

    useEffect(() => {
        console.log(getDue);
        setDues(getDue);
    }, [getDue]);

    const exportCSV = () => {
        dt.current.exportCSV();
    };


    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const shareholderBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                {rowData.loan_detail.kyc_detail.first_name}-<span style={{ color: "green", fontWeight: "bold" }}>{rowData.loan_detail.kyc_detail.pan}</span>
            </>
        );
    };

    const dueAmountBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Due Amount</span>
                {rowData.due_amount}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Due</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );


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

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={dues}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} dues"
                        globalFilter={globalFilter}
                        emptyMessage="No dues are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="shareholder" header="Shareholder" sortable body={shareholderBodyTemplate}></Column>
                        <Column field="share_type" header="Due Amount" sortable body={dueAmountBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" sortable body={created_atBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" sortable body={statusBodyTemplate}></Column>


                        </DataTable>


                </div>
            </div>
        </div>
    );

    }
export default React.memo(Due);
