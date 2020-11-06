export default class Api {

    constructor(settings) {
        this.apiUrl = `https://${window.location.hostname}`;
        this.endpoints = {
            getReport: '/api/courses/{course}/reports/{report}',
            getReportHistory: '/api/courses/{course}/reports',
            postIssue: '/api/issues/{issue}/fix',
            postFile: '',
        };
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

    postIssue() {

    }

    postFile() {

    }
}
