import React, { useState, useEffect } from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconEyeLine } from '@instructure/ui-icons'
import SortableTable from './SortableTable'
import FilesPageForm from './FilesPageForm'
import FilesTrayForm from './FilesTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Billboard } from '@instructure/ui-billboard'
import FilesModal from './FilesModal'

const fileTypes = [
  'pdf',
  'doc',
  'ppt',
  'xls',
]

export default function FilesPage({ t, report, settings, handleFileSave }) {
  const headers = [
    {id: "status", text: '', alignText: "center"},
    {id: "fileName", text: t('label.file_name')}, 
    {id: "fileType", text: t('label.file_type')}, 
    {id: "fileSize", text: t('label.file_size'), format: formatFileSize},
    {id: "updated", text: t('label.file_updated'), format: formatDate},
    {id: "action", text: "", alignText: "end"}
  ];

  const [activeFile, setActiveFile] = useState(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [filteredFiles, setFilteredFiles] = useState([])
  const [trayOpen, setTrayOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    fileTypes: [],
    hideReviewed: true
  })
  const [tableSettings, setTableSettings] = useState({
    sortBy: 'fileName',
    ascending: true,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })

  const handleSearchTerm = (e, val) => {
    setSearchTerm(val)
    setTableSettings({...tableSettings, pageNum: 0})
  }

  const handleTrayToggle = (e, val) => {
    setTrayOpen(!trayOpen)
  }

  const handleFilter = (filter) => {
    setFilters({...filters, ...filter})
    setTableSettings({
      sortBy: 'fileName',
      ascending: true,
      pageNum: 0,
      rowsPerPage: tableSettings.rowsPerPage
    })
  }

  const handleTableSettings = (setting) => {
    setTableSettings({...tableSettings, ...setting})
  }

  const handleActiveFile = (newFile, newIndex) => {
    setActiveFile(newFile)
    setActiveIndex(Number(newIndex))
  }

  const handleReviewClick = (activeFile) => {
    setModalOpen(true)
    setActiveFile(activeFile)
  }

  const handleCloseButton = () => {
    setModalOpen(false)
  }

  const getFilteredFiles = () => {  
    const { sortBy, ascending } = tableSettings 
    
    let filteredList = [];
    let fileList = Object.assign({}, report.files);
    
    // Loop through the files
    fileLoop: for (const [key, value] of Object.entries(fileList)) {
      let file = Object.assign({}, value)
      // Check if we are interested in this file type
      if (filters.fileTypes.length !== 0 && !filters.fileTypes.includes(file.fileType)) {
        continue;
      }
  
      // Check if we are hiding reviewed files
      if (filters.hideReviewed && file.reviewed) {
        continue;
      }

      // Filter by search term
      if (searchTerm !== '') {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!file.fileName.toLowerCase().includes(term)) {
              continue fileLoop;
            }
          }
        }
      }

      let status
      if (file.reviewed) {
        status = <>
          <ScreenReaderContent>{t('label.file.reviewed')}</ScreenReaderContent>
          <IconCheckLine color="success" /> 
        </>
      } else {
        status = <>
          <ScreenReaderContent>{t('label.file.needs_review')}</ScreenReaderContent>
          <IconEyeLine color="alert" />
        </>
      }

      filteredList.push(
        {
          id: file.id,
          status,
          file,
          fileName: file.fileName,
          fileType: file.fileType.toUpperCase(),
          fileSize: file.fileSize,
          updated: file.updated,
          action: <Button 
            key={`reviewButton${key}`}
            onClick={() => handleReviewClick(file)}
            textAlign="center" >{t('label.review')}</Button>,
          onClick: () => handleReviewClick(file),
        }
      );
    }

    filteredList.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1;
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1;
      }
    });

    if (!ascending) {
      filteredList.reverse();
    }

    return filteredList;
  }
  
  const resetFilters = () => {
    return {
      fileTypes: [],
      hideReviewed: false,
    };
  }

  const renderFilterTags = () => {
    let tags = [];
    
    for (const fileType of filters.fileTypes) {
      const id = `fileTypes||${fileType}`;
      tags.push({ id: id, label: t(`label.mime.${fileType}`) });
    }

    if (filters.hideReviewed) {
      tags.push({ id: `hideReviewed||true`, label: t(`label.hide_reviewed`)});
    }

    return tags.map((tag, i) => (
      <Tag margin="0 small small 0" 
        text={tag.label} 
        dismissible={true} 
        onClick={(e) => handleTagClick(tag.id, e)}
        key={i} 
        // elementRef={(node) => this[`tag${i}`] = node}
        elementRef={() => { React.createRef() }}
      />
    ));
  }

  const handleTagClick = (tagId, e) => {
    let [filterType, filterId] = tagId.split('||');
    let results = null;
    let index = 0

    switch (filterType) {
      case 'fileTypes':
        index += filters.fileTypes.findIndex((val) => filterId == val)
        results = filters.fileTypes.filter((val) => filterId !== val);
        break;
      case 'hideReviewed':
        index = filters.fileTypes.length
        results = false;
        break;
    }

    handleFilter({ [filterType]: results });
    if (index - 1 >= 0) {
      setTimeout(() => {
        this[`tag${index - 1}`].focus()
      })
    } else {
      setTimeout(() => {
        filesPageForm.focus()
      })
    }
  }

  const formatFileSize = (size) => {
    if (!size) {
      return 'N/A'
    }
    
    size = Number(size);
    if (size > 1000000) {
      return (Math.round(size / 100000) / 10) + ' MB';
    }
    if (size > 1000) {
      return (Math.round(size / 100) / 10) + ' KB';
    }

    return size;
  }

 const formatDate = (date) => {
    let parts = date.split('T')

    return parts[0]
  }

  useEffect(() => {
    setFilteredFiles(getFilteredFiles())
  }, [report, filters, searchTerm, tableSettings])

  return (
    <View as="div" key="filesPageFormWrapper" padding="small 0">
      <FilesPageForm 
        handleSearchTerm={handleSearchTerm} 
        handleTrayToggle={handleTrayToggle} 
        searchTerm={searchTerm}
        t={t} 
        ref={(node) => filesPageForm = node}
        handleTableSettings={handleTableSettings}
        tableSettings={tableSettings}
      />
      <View as="div" key="filterFileTags">
        {renderFilterTags()}
      </View>
      <SortableTable
        caption={t('files_page.table.caption')}
        headers = {headers}
        rows = {filteredFiles}
        filters = {filters}
        tableSettings = {tableSettings}
        handleFilter = {handleFilter}
        handleTableSettings = {handleTableSettings}
        t={t}
      />
      {trayOpen && <FilesTrayForm
        trayOpen={trayOpen}
        report={report}
        handleTrayToggle={handleTrayToggle} 
        handleFilter={handleFilter}
        filters={filters}
        fileTypes={fileTypes}
        t={t}
        />}
      {modalOpen && <FilesModal
        open={modalOpen}
        activeFile={activeFile}
        activeIndex={activeIndex}
        filteredRows={filteredFiles}
        settings={settings}
        handleCloseButton={handleCloseButton}
        handleActiveFile={handleActiveFile}
        handleFileSave={handleFileSave}
        t={t}
        />
      }

      {filteredFiles.length === 0 && 
          <Billboard
          size="medium"
          heading={t('label.no_results_header')}
          margin="small"
          message={t('label.no_results_message')}
      />}
    </View>
  )
}