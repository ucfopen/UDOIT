export default class Api {

    constructor(settings) {
        this.apiUrl = `https://${window.location.hostname}`;
        this.endpoints = {
            getReport: '/api/courses/{course}/reports/{report}',
            getReportHistory: '/api/courses/{course}/reports',
            setReportData: '/api/reports/{report}/setdata',
            updateAndGetReport: '/api/courses/{course}/reports/update',
            getIssueContent: '/api/issues/{issue}/content',
            saveIssue: '/api/issues/{issue}/save',
            reviewFile: '/api/files/{file}/review',
            postFile: '/api/files/{file}/post',
            deleteFile: '/api/files/{file}/delete',
            updateContent: '/api/{file}/content',
            adminCourses: '/api/admin/courses/account/{account}/term/{term}',
            scanContent: '/api/sync/content/{contentItem}?report={getReport}',
            scanCourse: '/api/sync/{course}',
            scanLmsCourse: '/api/admin/sync/lms/{lmsCourseId}',
            fullRescan: '/api/sync/rescan/{course}',
            adminReport: '/api/admin/courses/{course}/reports/latest',
            adminCourseReport: '/api/admin/courses/{course}/reports/full',
            adminReportHistory: '/api/admin/reports/account/{account}/term/{term}',
            adminUser: '/api/admin/users',
            updateUser: '/api/users/{user}'
        }
        this.settings = settings;

        if (settings && settings.apiUrl) {
            this.apiUrl = settings.apiUrl;
        }
    }

    getCourseId() {
        return this.settings.course.id;
    }

    getUserId() {
        return this.settings.user.id;
    }

    getReport(reportId) {
        const courseId = this.getCourseId();

        if (!reportId) {
            reportId = 'latest';
        }

        let url = `${this.apiUrl}${this.endpoints.getReport}`;
        url = url.replace('{course}', courseId).replace('{report}', reportId);

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    getReportHistory() {
        const courseId = this.getCourseId();

        let url = `${this.apiUrl}${this.endpoints.getReportHistory}`;
        url = url.replace('{course}', courseId);

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    setReportData(reportId, data) {
        let url = `${this.apiUrl}${this.endpoints.setReportData}`
        url = url.replace('{report}', reportId)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    }

    updateAndGetReport(courseId){
        let url = `${this.apiUrl}${this.endpoints.updateAndGetReport}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    saveIssue(issue, fullPageHtml, markAsReviewed = false) {
        let url = `${this.apiUrl}${this.endpoints.saveIssue}`
        url = url.replace('{issue}', issue.id)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'include',
            body: JSON.stringify({
              sourceHtml: issue.sourceHtml,
              newHtml: issue.newHtml,
              fullPageHtml: fullPageHtml,
              xpath: issue.xpath,
              markAsReviewed: markAsReviewed
            }),
        })
    }

    reviewFile(file, removeReplacement) {
        let url = `${this.apiUrl}${this.endpoints.reviewFile}`
        url = url.replace('{file}', file.id)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reviewed: file.reviewed, replacement: removeReplacement }),
        })
    }

    postFile(activeFile, fileObj) {
        let url = `${this.apiUrl}${this.endpoints.postFile}`
        url = url.replace('{file}', activeFile.id)

        let formData = new FormData()
        formData.append('file', fileObj)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'include',
            body: formData,
        })
    }

    deleteFile(activeFile) {
        let url = `${this.apiUrl}${this.endpoints.deleteFile}`
        url = url.replace('{file}', activeFile.id)

        return fetch(url, {
            method: 'DELETE',
            credentials: 'include',
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

    getAdminUser() {
        let url = `${this.apiUrl}${this.endpoints.adminUser}`

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    scanCourse(courseId)
    {
        let url = `${this.apiUrl}${this.endpoints.scanCourse}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    scanLmsCourse(lmsCourseId)
    {
        let url = `${this.apiUrl}${this.endpoints.scanLmsCourse}`
        url = url.replace('{lmsCourseId}', lmsCourseId)

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    fullRescan(courseId)
    {
        let url = `${this.apiUrl}${this.endpoints.fullRescan}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    scanContent(contentId, getReport = true)
    {
        let url = `${this.apiUrl}${this.endpoints.scanContent}`
        url = url.replace('{contentItem}', contentId)
        url = url.replace('{getReport}', getReport)

        return fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    getIssueContent(issueId) {
      let url = `${this.apiUrl}${this.endpoints.getIssueContent}`
      url = url.replace('{issue}', issueId)

      return fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
      })
    }

    updateUser(user) {
        let url = `${this.apiUrl}${this.endpoints.updateUser}`
        url = url.replace('{user}', user.id)

        return fetch(url, {
            method: 'PUT',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        })
    }
}
