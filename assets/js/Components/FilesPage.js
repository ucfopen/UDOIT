import React from 'react';
import { Button } from '@instructure/ui-buttons'
import { IconCheckLine, IconEyeLine } from '@instructure/ui-icons'
import SortableTable from './SortableTable'
import FilesPageForm from './FilesPageForm'
import FilesTrayForm from './FilesTrayForm'
import { View } from '@instructure/ui-view'
import { Tag } from '@instructure/ui-tag'

const fileTypes = [
  'pdf',
  'doc',
  'ppt',
  //'xls',
]

class FilesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeFile: null,
      trayOpen: false,
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

    this.handleTrayToggle = this.handleTrayToggle.bind(this);
    this.handleSearchTerm = this.handleSearchTerm.bind(this);
    this.handleTableSettings = this.handleTableSettings.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
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

  getFileById = (contentList, contentId) => {
    return Object.assign({}, contentList[contentId]);
  }

  getFilteredFiles = () => {
    const report = this.props.report;
    const filters = this.state.filters;    
    
    var filteredList = [];
    var fileList = Object.assign({}, report.files);
    
    // Loop through the files
    fileLoop: for (const [key, value] of Object.entries(fileList)) {
      var file = Object.assign({}, value)
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

      const status = (file.reviewed) ? <IconCheckLine color="success" /> : <IconEyeLine color="alert" />;

      filteredList.push(
        {
          status,
          fileName: file.fileName,
          fileType: file.fileType.toUpperCase(),
          fileSize: file.fileSize,
          action: <Button onClick={this.handleReviewClick} textAlign="center" >{this.props.t('label.review')}</Button>
        }
      );
    }

    return filteredList;
  }

  render() {
    const headers = [
      {id: "status", text: '', alignText: "center"},
      {id: "fileName", text: this.props.t('label.file_name')}, 
      {id: "fileType", text: this.props.t('label.content_type')}, 
      {id: "fileSize", text: this.props.t('label.file_size'), format: this.formatFileSize},
      {id: "action", text: "", alignText: "end"}
    ];
    const filteredFiles = this.getFilteredFiles();

    return (
      <View as="div" key="filesPageFormWrapper">
        <FilesPageForm 
          handleSearchTerm={this.handleSearchTerm} 
          handleTrayToggle={this.handleTrayToggle} 
          searchTerm={this.state.searchTerm}
          t={this.props.t} />
        <View as="div" key="filterFileTags">
          {this.renderFilterTags()}
        </View>
        <SortableTable
          caption="Files Table"
          headers = {headers}
          rows = {filteredFiles}
          filters = {this.state.filters}
          tableSettings = {this.state.tableSettings}
          handleFilter = {this.handleFilter}
          handleTableSettings = {this.handleTableSettings}
          key="filesTable" />
        <FilesTrayForm
          trayOpen={this.state.trayOpen}
          report={this.props.report}
          handleTrayToggle={this.handleTrayToggle} 
          handleFilter={this.handleFilter}
          filters={this.state.filters}
          fileTypes={fileTypes}
          t={this.props.t}
          key="filesTrayForm" />
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