import React, { useEffect, useState } from 'react'
import SortableTable from './SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'

const DashboardCourseTable = ({t, courses}) => {
    const [rows, setRows] = useState([])

    const [tableSettings, setTableSettings] = useState({
        sortBy: 'totalActiveIssues',
        ascending: false,
        pageNum: 0,
      })
    
    const headers = [
        { id: "title", text: "Course Name" },
        { id: "totalActiveIssues", text: "Barriers"},
        { id: "scanRule", text: "Most Recurring Barrier"},
        {id: "lastUpdated", text: "Last Updated"}
    ]

  
    const sortContent = () => {
    let tempRows = courses ? courses.map((course) => ({
      ...course,
      scanRule: t(`form.${formNameFromRule(course.scanRule)}.title`),
      lastUpdated: (new Date(course.lastUpdated)).toDateString(),
    })) : []

    const { sortBy, ascending } = tableSettings

    tempRows.sort((a, b) => {
      let aValue = a[sortBy] ?? ''
      let bValue = b[sortBy] ?? ''

      if (typeof(aValue) === "object" && typeof(bValue) === "object") {
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
    }, [tableSettings, courses])

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting))
  }

    return (
        <>
              <SortableTable
                caption={"Courses With Most Accessibility Barriers"}
                headers={headers}
                rows={rows}
                tableSettings={tableSettings}
                handleTableSettings={handleTableSettings}
                t={t}
              />
            </>
    )
}

export default DashboardCourseTable
