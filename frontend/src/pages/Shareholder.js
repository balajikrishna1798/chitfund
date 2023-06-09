import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useGetShareTypesQuery } from "../service/ShareTypeApi";
import { useGetShareholderQuery, useUpdateShareholderMutation, useAddShareholderMutation } from "../service/ShareholderApi";
import { useGetKycsQuery,useGetKycQuery } from "../service/KycApi";
import { Skeleton } from "primereact/skeleton";
import { InputNumber } from 'primereact/inputnumber';
import { AutoSizer, List } from "react-virtualized";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Tag } from "primereact/tag";
import { created_atBodyTemplate } from "../components/createdAtBodyTemplate";
import { useNavigate,Link } from "react-router-dom";
import Meta from "../components/Meta";
import { useDispatch } from "react-redux";

const Shareholder = () => {
    const [search,setSearch] = useState("")
        const [searchh, setSearchh] = useState('');

    const [addShareholder] = useAddShareholderMutation();
    const [shareholders, setShareholders] = useState(null);
    const [kycs, setKycs] = useState([]);
    const [shares, setShares] = useState(null);
    const [shareDialog, setShareDialog] = useState(false);
    const toast = useRef(null);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    const [loadings, setLoadings] = useState(false);
    const dt = useRef(null);
    const { data: share_id } = useGetShareTypesQuery();
    const { data: getShareholder, isLoading: loading } = useGetShareholderQuery({page:lazyState.page,search:search});
    const [updateShareholder] = useUpdateShareholderMutation();
    const { data:getKycs } = useGetKycQuery({ page: currentPage,search:searchh });

console.log(kycs);
    useEffect(() => {
        console.log(getKycs);
        if (getKycs) {
          setKycs((prevKycs) => [...prevKycs, ...getKycs?.results]);
        }
      }, [getKycs]);

    useEffect(() => {
        setShares(share_id);
    }, [share_id]);

    useEffect(() => {
        setShareholders(getShareholder && getShareholder.results);
    }, [getShareholder]);

    const fetchNextData = (e) => {
if(getKycs.next){
            setCurrentPage(currentPage + 1);
}
      };


    const onPage = (event) => {
        console.log("event", event);
        setlazyState(event);
    };
    const shareTypeSchema = Yup.object().shape({
        kyc: Yup.number().required("This Field is Required"),
        share_type: Yup.string().required("This Field is Required"),
        number_of_shares: Yup.number().required("This Field is Required").moreThan(0, "Should be greater than Zero"),
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
            const { id, kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share } = values;

            if (values.id) {
                const index = findIndexById(values.id);
                _deposits[index] = _deposit;
                updateShareholder({ id, kyc, share_type, amount, interest_type, number_of_shares, starting_share, ending_share })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Shareholder details Updated", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
            } else {
                addShareholder({ kyc, amount, share_type, interest_type, number_of_shares, starting_share, ending_share })
                    .unwrap()
                    .then((payload) => toast.current.show({ severity: "success", summary: "Successfull", detail: "Shareholder details Created", life: 3000 }))
                    .catch((error) => toast.current.show({ severity: "warn", summary: "Error", detail: "Some Error from server", life: 5000 }));
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
                {rowData.kyc_detail.first_name}
            </>
        );
    };

    const kycIdBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">Share Value</span>
                <Link to={`/kyc/${rowData?.kyc_detail.id}`}><span style={{color:"#495057",fontWeight:"bold"}}>{rowData.kyc_detail.slug}</span></Link>
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
            <div className="actions flex flex-row">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-1" onClick={() => editProduct(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">ShareHolders</h5>
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
                <div>{option.slug}</div>
                <div> ({option.share_type})</div>
            </div>
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
                    <div>{option.slug}</div>
                    <div> ({option.share_type})</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const displayKycTemplate = (option) => {
        console.log("option", option);
        return (
            <div className="flex align-items-center">
                <div>{option.slug}</div>
                <div> - {option.first_name}</div>
            </div>
        );
    };

    const selectedKycTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.slug}</div>
                    <div> - {option.first_name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const slugBodyTemplate = (rowData) => {
        console.log(rowData);
        return (
            <>
                <span className="p-column-title">ID</span>
                <Link to={`${rowData.id}`}><span style={{color:"#495057",fontWeight:"bold"}}>{rowData.slug}</span></Link>
            </>
        );
    };

const handleNumberOfShares = (e) =>{
formik.setFieldValue("number_of_shares",e.value)
}
    const onHandleSearchChange = (e) =>{
        setSearch(e.target.value);

    }

    const filteredKycs = kycs.filter((kyc) => kyc.slug.toLowerCase().includes(searchh.toLowerCase()));


    return (
        <div className="grid crud-demo">
            <Meta title={"Shareholders"} />
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />

                    <InputText className="mb-5" value={search} id="first_name_search" type="text" name="first_name_search" placeholder="Search" onChange={(e) => onHandleSearchChange(e)} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    {loading ? (
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
            ) : ( <DataTable
                        ref={dt}
                        lazy
                        dataKey="id"
                        value={getShareholder?.results}
                        paginator
                        rows={10}
                        onPage={onPage}
                        first={lazyState.first}
                        loading={loading}
                        totalRecords={getShareholder && getShareholder.count}
                        className="datatable-responsive"
                        scrollable
                        scrollHeight="400px"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} shareholders"
                        emptyMessage="No shareholders are found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="slug" header="Shareholder ID" body={slugBodyTemplate}></Column>
                        <Column field="kyc" header="KYC" body={codeBodyTemplate}></Column>
                        <Column field="kyc_id" header="KYC ID" body={kycIdBodyTemplate}></Column>
                        <Column field="share_type" header="Share Type" body={shareBodyTemplate}></Column>
                        <Column field="number_of_shares" header="Number of  Shares" body={numberofshareBodyTemplate}></Column>
                        <Column field="starting_share" header="Starting Share" body={startingshareBodyTemplate}></Column>
                        <Column field="ending_share" header="Ending Share" body={endingshareBodyTemplate}></Column>
                        <Column field="created_at" header="Created On" body={created_atBodyTemplate}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>)}

                    <Dialog visible={shareDialog} style={{ width: "450px" }} header="Shareholders" modal className="p-fluid" onHide={hideDialog}>
                        <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                            <div className="grid formgrid">
                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="kyc">KYC</label>
                                    <Dropdown
  value={formik.values.kyc}
  name="kyc"
  filter
  virtualScrollerOptions={{lazy: true,itemSize:getKycs?.count,onLazyLoad:fetchNextData}}
  onChange={formik.handleChange("kyc")}
  options={filteredKycs}
  valueTemplate={selectedKycTemplate}
  itemTemplate={displayKycTemplate}
  optionLabel="slug"
  optionValue="id"
  placeholder="Select User"

  className={`${formik.touched.kyc && formik.errors.kyc && "p-invalid"}`}
  style={{ maxHeight: '250px', overflowY: 'auto' }}
/>



                                    {formik.errors.kyc && formik.touched.kyc && <p className="error">{formik.errors.kyc}</p>}
                                </div>

                                <div className="field col-12 mb-2 lg:col-6 lg:mb-0">
                                    <label htmlFor="share_type">Share Type</label>
                                    <Dropdown
                                        value={formik.values.share_type}
                                        name="share_type"
                                        id="share_type"
                                        filter
                                        filterBy="slug,share_type"
                                        onChange={formik.handleChange("share_type")}
                                        options={shares}
                                        valueTemplate={selectedShareTemplate}
                                        itemTemplate={ShareTypeDropdownTemplate}
                                        optionLabel="slug"
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
                                    <InputNumber
                                        value={formik.values.number_of_shares || ""}
                                        className={`${formik.touched.number_of_shares && formik.errors.number_of_shares && "p-invalid"}`}
                                        disabled={formik.values.id ? true : false}
                                        name="number_of_shares"
                                        id="number_of_shares"

                                        onChange={(e)=>handleNumberOfShares(e)}
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
