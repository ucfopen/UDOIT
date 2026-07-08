export default class Api {

    constructor(instanceInfo) {
      this.apiUrl = `https://${window.location.hostname}`;
      this.endpoints = {
        adminCourses: '/api/admin/courses/account/{account}/term/{term}',
        adminCourseReport: '/api/admin/courses/{course}/reports/full',
        adminReport: '/api/admin/courses/{course}/reports/latest',
        adminReportHistory: '/api/admin/reports/account/{account}/term/{term}',
        adminUser: '/api/admin/users',

        getMediaTracks: '/api/media/{mediaId}/tracks',
        getIssueContent: '/api/issues/{issue}/content',
        getReport: '/api/courses/{course}/reports/{report}',
        getReportHistory: '/api/courses/{course}/reports',
        updateAndGetReport: '/api/courses/{course}/reports/update',

        batchDelete: '/api/{course}/files/delete',
        deleteFile: '/api/files/{file}/delete',
        downloadFile: '/api/files/{file}/download',
        fullRescan: '/api/sync/rescan/{course}',
        postFile: '/api/files/{file}/post',
        saveIssue: '/api/issues/{issue}/save',
        reviewFile: '/api/files/{file}/review',
        scanContent: '/api/sync/content/{contentItem}?report={getReport}',
        scanCourse: '/api/sync/{course}',
        scanLmsCourse: '/api/admin/sync/lms/{lmsCourseId}',
        setMediaTracks: '/api/media/{mediaId}/settracks',
        setReportData: '/api/reports/{report}/setdata',
        updateContent: '/api/{file}/content',
        updatePreferences: '/api/users/{user}/preferences'
      }
      this.instanceInfo = instanceInfo;
  
    if (instanceInfo && instanceInfo.apiUrl) {
      this.apiUrl = instanceInfo.apiUrl;
    }
  }

  getCourseId() {
    return this.instanceInfo.course.id;
  }

  getUserId() {
    return this.instanceInfo.user.id;
  }

  getMediaTracks(mediaId) {
      let url = `${this.apiUrl}${this.endpoints.getMediaTracks}`
      url = url.replace('{mediaId}', mediaId)

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      })
  }

  setMediaTracks(mediaId, newTracks) {
      let url = `${this.apiUrl}${this.endpoints.setMediaTracks}`
      url = url.replace('{mediaId}', mediaId)

      return fetch(url, {
          method: 'POST',
          cache: 'no-cache',
          credentials: 'include',
          body: JSON.stringify({
              tracks: newTracks
          })
      })
  }

  updateContent(contentOptions, sectionOptions, fileId){
      let url = `${this.apiUrl}${this.endpoints.updateContent}`
      url = url.replace('{file}', fileId)

      return fetch(url, {
          method: 'POST',
          cache: 'no-cache',
          credentials: 'include',
          body: JSON.stringify({
              content: contentOptions,
              section: sectionOptions
          })
      })
  }

  getAdminCourses(filters) {
      let url = `${this.apiUrl}${this.endpoints.adminCourses}`
      url = url.replace('{account}', filters.accountId)
          .replace('{term}', filters.termId)

      if (filters.includeSubaccounts) {
          url += '?subaccounts=true'
      }

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  }

  getAdminReportHistory(filters) {
      let url = `${this.apiUrl}${this.endpoints.adminReportHistory}`
      url = url.replace('{account}', filters.accountId)
          .replace('{term}', filters.termId)

      if (filters.includeSubaccounts) {
          url += '?subaccounts=true'
      }

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  }

  getAdminReport(courseId) {
      let url = `${this.apiUrl}${this.endpoints.adminReport}`
      url = url.replace('{course}', courseId)

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  }

  getCourseReport(courseId) {
      let url = `${this.apiUrl}${this.endpoints.adminCourseReport}`
      url = url.replace('{course}', courseId)

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      });
  }

  getReport(reportId) {
    const courseId = this.getCourseId();

    if (!reportId) {
      reportId = "latest";
    }

    let url = `${this.apiUrl}${this.endpoints.getReport}`;
    url = url.replace("{course}", courseId).replace("{report}", reportId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  getReportHistory() {
    const courseId = this.getCourseId();

    let url = `${this.apiUrl}${this.endpoints.getReportHistory}`;
    url = url.replace("{course}", courseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setReportData(reportId, data) {
    let url = `${this.apiUrl}${this.endpoints.setReportData}`;
    url = url.replace("{report}", reportId);

    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  updateAndGetReport(courseId) {
    let url = `${this.apiUrl}${this.endpoints.updateAndGetReport}`;
    url = url.replace("{course}", courseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  saveIssue(issue, fullPageHtml, markAsReviewed = false) {
    let url = `${this.apiUrl}${this.endpoints.saveIssue}`;
    url = url.replace("{issue}", issue.id);

    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      body: JSON.stringify({
        sourceHtml: issue.sourceHtml,
        newHtml: issue.newHtml,
        fullPageHtml: fullPageHtml,
        xpath: issue.xpath,
        markAsReviewed: markAsReviewed,
      }),
    });
  }

  reviewFile(file, removeReplacement) {
    let url = `${this.apiUrl}${this.endpoints.reviewFile}`;
    url = url.replace("{file}", file.id);

    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reviewed: file.reviewed,
        replacement: removeReplacement,
      }),
    });
  }

  postFile(activeFile, fileObj) {
    let url = `${this.apiUrl}${this.endpoints.postFile}`;
    url = url.replace("{file}", activeFile.id);

    let formData = new FormData();
    formData.append("file", fileObj);

    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      body: formData,
    });
  }

  deleteFile(activeFile) {
    let url = `${this.apiUrl}${this.endpoints.deleteFile}`;
    url = url.replace("{file}", activeFile.id);

    return fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async downloadFile(fileId, contentType = "video/mp4") {
    let url = `${this.apiUrl}${this.endpoints.downloadFile}`;
    url = url.replace("{file}", fileId);

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": contentType,
        },
      });
      const contentLength = response.headers.get('Content-Length');

      if (contentLength > 0) {
          console.log(`Total file size reported by server: ${contentLength} bytes`);
          // You can use this total size for your state management
      } else {
            console.warn("Server did not provide Content-Length header.");
      }
      return response;

    } catch (e) {
      console.error(e);
    }
  }

  batchDelete(urlList) {
    let url = `${this.apiUrl}${this.endpoints.batchDelete}`
    url = url.replace('{course}', this.getCourseId())

    return fetch(url, {
      method: 'DELETE',
      credentials: "include",
      body: JSON.stringify({
        paths: urlList
      })
    })
  }

  updateContent(contentOptions, sectionOptions, fileId) {
    let url = `${this.apiUrl}${this.endpoints.updateContent}`;
    url = url.replace("{file}", fileId);

    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      body: JSON.stringify({
        content: contentOptions,
        section: sectionOptions,
      }),
    });
  }

  getAdminCourses(filters) {
    let url = `${this.apiUrl}${this.endpoints.adminCourses}`;
    url = url
      .replace("{account}", filters.accountId)
      .replace("{term}", filters.termId);

    if (filters.includeSubaccounts) {
      url += "?subaccounts=true";
    }

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  getAdminReport(courseId) {
    let url = `${this.apiUrl}${this.endpoints.adminReport}`;
    url = url.replace("{course}", courseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  getAdminUser() {
    let url = `${this.apiUrl}${this.endpoints.adminUser}`;

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  scanCourse(courseId) {
    let url = `${this.apiUrl}${this.endpoints.scanCourse}`;
    url = url.replace("{course}", courseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  scanLmsCourse(lmsCourseId) {
    let url = `${this.apiUrl}${this.endpoints.scanLmsCourse}`;
    url = url.replace("{lmsCourseId}", lmsCourseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  fullRescan(courseId) {
    let url = `${this.apiUrl}${this.endpoints.fullRescan}`;
    url = url.replace("{course}", courseId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  scanContent(contentId, getReport = true) {
    let url = `${this.apiUrl}${this.endpoints.scanContent}`;
    url = url.replace("{contentItem}", contentId);
    url = url.replace("{getReport}", getReport);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  getIssueContent(issueId) {
    let url = `${this.apiUrl}${this.endpoints.getIssueContent}`;
    url = url.replace("{issue}", issueId);

    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  updatePreferences(newPreferences) {
    let url = `${this.apiUrl}${this.endpoints.updatePreferences}`;
    url = url.replace("{user}", this.getUserId());

    return fetch(url, {
      method: "PATCH",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPreferences),
    });
  }
}
