export default class Api {

    constructor(settings) {
        this.apiUrl = `https://${window.location.hostname}`;
        this.endpoints = {
            getReport: '/api/courses/{course}/reports/{report}',
            getReportHistory: '/api/courses/{course}/reports',
            saveIssue: '/api/issues/{issue}/save',
            resolveIssue: '/api/issues/{issue}/resolve',
            reviewFile: '/api/files/{file}/review',
            postFile: '/api/files/{file}/post',
            reportPdf: '/download/courses/{course}/reports/pdf',
            adminCourses: '/api/admin/courses/account/{account}/term/{term}',
            scanContent: '/api/sync/content/{contentItem}',
            scanCourse: '/api/sync/{course}',
            fullRescan: '/api/sync/rescan/{course}',
            scanIssue: '/api/issues/{issue}/scan',
            adminReport: '/api/admin/courses/{course}/reports/latest',
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

    getAuthToken() {
        return this.settings.clientToken;
    }

    getReport(reportId) {
        const courseId = this.getCourseId();
        const authToken = this.getAuthToken();

        if (!reportId) {
            reportId = 'latest';
        }

        let url = `${this.apiUrl}${this.endpoints.getReport}`;
        url = url.replace('{course}', courseId).replace('{report}', reportId);

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        });
    }

    getReportHistory() {
        const courseId = this.getCourseId();
        const authToken = this.getAuthToken();

        let url = `${this.apiUrl}${this.endpoints.getReportHistory}`;
        url = url.replace('{course}', courseId);

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        });
    }

    saveIssue(issue) {
        const authToken = this.getAuthToken()

        let url = `${this.apiUrl}${this.endpoints.saveIssue}`
        url = url.replace('{issue}', issue.id)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'X-AUTH-TOKEN': authToken,
            },
            body: issue.newHtml
        })
    }

    resolveIssue(issue) {
        const authToken = this.getAuthToken()

        let url = `${this.apiUrl}${this.endpoints.resolveIssue}`
        url = url.replace('{issue}', issue.id)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
            body: JSON.stringify({status: issue.status, newHtml: issue.newHtml}),
        })
    }

    reviewFile(file) {
        const authToken = this.getAuthToken()

        let url = `${this.apiUrl}${this.endpoints.reviewFile}`
        url = url.replace('{file}', file.id)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
            body: JSON.stringify({ reviewed: file.reviewed }),
        })
    }

    postFile(activeFile, fileObj) {
        const authToken = this.getAuthToken()

        let url = `${this.apiUrl}${this.endpoints.postFile}`
        url = url.replace('{file}', activeFile.id)

        let formData = new FormData()
        formData.append('file', fileObj)

        return fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'X-AUTH-TOKEN': authToken,
            },
            body: formData,
        })
    }

    getPdfUrl() {
        const courseId = this.getCourseId()
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.reportPdf}?auth_token=${authToken}`

        return url.replace('{course}', courseId)
    }

    getAdminCourses(filters) {
        const authToken = this.getAuthToken();

        let url = `${this.apiUrl}${this.endpoints.adminCourses}`
        url = url.replace('{account}', filters.accountId)
            .replace('{term}', filters.termId)
        
        if (filters.includeSubaccounts) {
            url += '?subaccounts=true'
        }
        
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        });
    }

    getAdminReportHistory(filters) {
        const authToken = this.getAuthToken();

        let url = `${this.apiUrl}${this.endpoints.adminReportHistory}`
        url = url.replace('{account}', filters.accountId)
            .replace('{term}', filters.termId)
        
        if (filters.includeSubaccounts) {
            url += '?subaccounts=true'
        }

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        });
    }

    getAdminReport(courseId) {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.adminReport}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        });
    }

    getAdminUser() {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.adminUser}`

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        })
    }

    scanCourse(courseId)
    {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.scanCourse}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        })
    }

    fullRescan(courseId)
    {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.fullRescan}`
        url = url.replace('{course}', courseId)

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        })
    }

    scanContent(contentId)
    {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.scanContent}`
        url = url.replace('{contentItem}', contentId)

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        })
    }

    scanIssue(issueId)
    {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.scanIssue}`
        url = url.replace('{issue}', issueId)

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
        })
    }

    updateUser(user) {
        const authToken = this.getAuthToken()
        let url = `${this.apiUrl}${this.endpoints.updateUser}`

        url = url.replace('{user}', user.id)

        return fetch(url, {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-TOKEN': authToken,
            },
            body: JSON.stringify(user),
        })
    }
}
