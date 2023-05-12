import React from "react";

export const slugBodyTemplate = (rowData) => {
    console.log(rowData);
    return (
        <>
            <span className="p-column-title">ID</span>
            {rowData.slug}
        </>
    );
};
