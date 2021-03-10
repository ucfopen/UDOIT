import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconInfoBorderlessLine, IconEyeLine } from '@instructure/ui-icons'
import SortableTable from './SortableTable'
import FilesPageForm from './FilesPageForm'
import FilesTrayForm from './FilesTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import FilesModal from './FilesModal'

const fileTypes = [
  'pdf',
  'doc',
  'ppt',
  'xls',
]

class FilesPage extends React.Component {
  constructor(props) {
    super(props);

    this.headers = [
      {id: "status", text: '', alignText: "center"},
      {id: "fileName", text: this.props.t('label.file_name')}, 
      {id: "fileType", text: this.props.t('label.file_type')}, 
      {id: "fileSize", text: this.props.t('label.file_size'), format: this.formatFileSize},
      {id: "updated", text: this.props.t('label.updated_at')},
      {id: "action", text: "", alignText: "end"}
    ];

    this.state = {
      activeFile: null,
      activeIndex: -1,
      trayOpen: false,
      modalOpen: false,
      searchTerm: '',
      filters: {
        fileTypes: [],
        hideReviewed: true
      },
      tableSettings: {
        sortBy: 'fileName',
        ascending: true,
        pageNum: 0,
      }
    }

    this.handleTrayToggle = this.handleTrayToggle.bind(this)
    this.handleSearchTerm = this.handleSearchTerm.bind(this)
    this.handleTableSettings = this.handleTableSettings.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleReviewClick = this.handleReviewClick.bind(this)
    this.handleActiveFile = this.handleActiveFile.bind(this)
  }

  componentDidMount() {
  }

  handleSearchTerm = (e, val) => {
    this.setState({searchTerm: val});
  }

  handleTrayToggle = (e, val) => {
    this.setState({trayOpen: !this.state.trayOpen});
  }

  handleFilter = (filter) => {
    this.setState({
      filters: Object.assign({}, this.state.filters, filter),
      tableSettings: {
        sortBy: 'fileName',
        ascending: true,
        pageNum: 0,
      }
    })
  }

  handleTableSettings = (setting) => {
    this.setState({
      tableSettings: Object.assign({}, this.state.tableSettings, setting)
    });
  }

  handleActiveFile(newFile, newIndex) {
    this.setState({
      activeFile: newFile,
      activeIndex: Number(newIndex)
    })
  }

  handleReviewClick(activeFile) {
    this.setState({
      modalOpen: true,
      activeFile: activeFile
    })
  }

  handleCloseButton = () => {
    this.setState({
      modalOpen: false
    })
  }

  getFilteredFiles = () => {
    const report = this.props.report;
    const filters = this.state.filters;    
    const { sortBy, ascending } = this.state.tableSettings 
    
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
      if (this.state.searchTerm !== '') {
        const searchTerms = this.state.searchTerm.toLowerCase().split(' ');
        
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
          <ScreenReaderContent>{this.props.t('table.suggestion')}</ScreenReaderContent>
          <IconCheckLine color="success" /> 
        </>
      } else {
        status = <>
          <ScreenReaderContent>{this.props.t('table.error')}</ScreenReaderContent>
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
          action: <Button 
            key={`reviewButton${key}`}
            onClick={() => this.handleReviewClick(file)}
            textAlign="center" >{this.props.t('label.review')}</Button>,
          onClick: () => this.handleReviewClick(file),
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

  render() {
    const filteredFiles = this.getFilteredFiles();

    return (
      <View as="div" key="filesPageFormWrapper" padding="small 0">
        <FilesPageForm 
          handleSearchTerm={this.handleSearchTerm} 
          handleTrayToggle={this.handleTrayToggle} 
          searchTerm={this.state.searchTerm}
          t={this.props.t} />
        <View as="div" key="filterFileTags">
          {this.renderFilterTags()}
        </View>
        <SortableTable
          caption={this.props.t('files_page.table.caption')}
          headers = {this.headers}
          rows = {filteredFiles}
          filters = {this.state.filters}
          tableSettings = {this.state.tableSettings}
          handleFilter = {this.handleFilter}
          handleTableSettings = {this.handleTableSettings}
          t={this.props.t}
        />
        {this.state.trayOpen && <FilesTrayForm
          trayOpen={this.state.trayOpen}
          report={this.props.report}
          handleTrayToggle={this.handleTrayToggle} 
          handleFilter={this.handleFilter}
          filters={this.state.filters}
          fileTypes={fileTypes}
          t={this.props.t}
          />}
        {this.state.modalOpen && <FilesModal
          open={this.state.modalOpen}
          activeFile={this.state.activeFile}
          activeIndex={this.state.activeIndex}
          filteredRows={filteredFiles}
          settings={this.props.settings}
          handleCloseButton={this.handleCloseButton}
          handleActiveFile={this.handleActiveFile}
          handleFileSave={this.props.handleFileSave}
          t={this.props.t}
          />
        }
      </View>
    )
  }

  resetFilters() {
    return {
      fileTypes: [],
      hideReviewed: false,
    };
  }

  renderFilterTags() {
    let tags = [];
    
    for (const fileType of this.state.filters.fileTypes) {
      const id = `fileTypes||${fileType}`;
      tags.push({ id: id, label: this.props.t(`label.mime.${fileType}`) });
    }

    if (this.state.filters.hideReviewed) {
      tags.push({ id: `hideReviewed||true`, label: this.props.t(`label.hide_reviewed`)});
    }

    return tags.map((tag) => (
      <Tag margin="0 small small 0" 
        text={tag.label} 
        dismissible={true} 
        onClick={(e) => this.handleTagClick(tag.id, e)}
        key={tag.id} />
    ));
  }

  handleTagClick(tagId, e) {
    let [filterType, filterId] = tagId.split('||');
    let results = null;

    switch (filterType) {
      case 'fileTypes':
        results = this.state.filters.fileTypes.filter((val) => filterId !== val);
        break;
      case 'hideReviewed':
        results = false;
        break;
    }

    this.handleFilter({ [filterType]: results });
  }

  formatFileSize(size) {
    size = Number(size);
    if (size > 1000000) {
      return (Math.round(size / 100000) / 10) + ' MB';
    }
    if (size > 1000) {
      return (Math.round(size / 100) / 10) + ' KB';
    }

    return size;
  }
}

export default FilesPage;