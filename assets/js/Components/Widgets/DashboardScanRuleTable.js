import React, { useEffect, useState } from 'react'
import SortableTable from './SortableTable'

const DashboardScanRuleTable = ({ t, scanRuleRanked }) => {
    const [rows, setRows] = useState([])

    const [tableSettings, setTableSettings] = useState({
        sortBy: 'rank',
        ascending: true,
        pageNum: 0,
    })

    const headers = [
        { id: "rank", text: "Rank" },
        { id: "rawRule", text: "Equal Access Scanner Rule" },
        { id: "normalizedRule", text: "Normalized Rule" },
        { id: "count", text: "Number of Courses" }
    ]

    const sortContent = () => {
        let tempRows = scanRuleRanked ? scanRuleRanked : []

        const { sortBy, ascending } = tableSettings

        tempRows.sort((a, b) => {
            let aValue = a[sortBy] ?? ''
            let bValue = b[sortBy] ?? ''

            if (typeof (aValue) === "object" && typeof (bValue) === "object") {
                aValue = a[sortBy + "_display"] || ""
                bValue = b[sortBy + "_display"] || ""
            }

            if (isNaN(aValue) || isNaN(bValue)) {
                return (String(aValue).toLowerCase() > String(bValue).toLowerCase()) ? -1 : 1
            } else {
                return (Number(aValue) < Number(bValue)) ? -1 : 1
            }
        })

        if (!ascending) {
            tempRows.reverse()
        }

        return tempRows
    }

    useEffect(() => {
        setRows(sortContent())
    }, [tableSettings, scanRuleRanked])

    const handleTableSettings = (setting) => {
        setTableSettings(Object.assign({}, tableSettings, setting))
    }

    return (
        <>
            <SortableTable
                caption={"Most Frequent Scan Rules by Courses"}
                headers={headers}
                rows={rows}
                tableSettings={tableSettings}
                handleTableSettings={handleTableSettings}
                t={t}
            />
        </>
    )
}

export default DashboardScanRuleTable