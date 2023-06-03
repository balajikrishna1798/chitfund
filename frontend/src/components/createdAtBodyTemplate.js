import React from "react";
import moment from "moment";
export const created_atBodyTemplate = (rowData) => {
    return (
        <>
            <span className="p-column-title"> Amount</span>
            {moment(rowData.created_at).format("DD-MM-yyyy, HH:mm:ss")}
        </>
    );
};
