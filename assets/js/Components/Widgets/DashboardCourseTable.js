import React, { useEffect, useState } from 'react'
import SortableTable from './SortableTable'
import { formNameFromRule } from '../../Services/Ufixit'

const DashboardCourseTable = ({t, courses, handleReportClick}) => {
    const [rows, setRows] = useState([])

    const [tableSettings, setTableSettings] = useState({
        sortBy: 'totalActiveIssues',
        ascending: false,
        pageNum: 0,
      })
    
    const headers = [
        { id: "title", text: t("report.header.course_name") },
        { id: "totalActiveIssues", text: t("report.header.issues")},
        { id: "scanRule", text: t("admin.dashboard.header.recurring_barrier")},
        {id: "lastUpdated", text: t("admin.dashboard.header.last_updated")}
    ]

  
    const sortContent = () => {
       let tempRows = courses ? courses.map((course) => ({
         ...course,
         title_display: course.title,
         title: (
           <a
             href="#reports"
             onClick={(event) => {
               event.preventDefault()
               handleReportClick(course)
             }}
           >
             {course.title}
           </a>
         ),
          scanRule: course.scanRule
            ? t(`form.${formNameFromRule(course.scanRule)}.title`)
            : formNameFromRule(course.scanRule),
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
                caption={t("admin.dashboard.course_barriers_caption")}
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
