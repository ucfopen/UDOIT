import { rest } from 'msw'

export const handlers = [
  // Api.js getReport
  rest.get('/api/courses/:course_id/reports/:report_id', (req, res, ctx) => {
    const { course_id, report_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js getReportHistory
  rest.get('/api/courses/:course_id/reports', (req, res, ctx) => {
    const { course_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js saveIssue
  rest.post('/api/issues/:issue_id/save', (req, res, ctx) => {
    const { issue_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js resolveIssue
  rest.post('/api/issues/:issue_id/resolve', (req, res, ctx) => {
    const { issue_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js reviewFile
  rest.post('/api/files/:file/review', (req, res, ctx) => {
    const { file } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js postFile
  rest.post('/api/files/:file/post', (req, res, ctx) => {
    const { file } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js adminCourses
  rest.get(
    '/api/admin/courses/account/:account_id/term/:term_id',
    (req, res, ctx) => {
      const { account_id, term_id } = req.params

      return res(ctx.status(200), ctx.json({}))
    }
  ),
  // Api.js scanCourse
  rest.get('/api/sync/:course_id', (req, res, ctx) => {
    const { course_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js adminReport
  rest.get('/api/admin/courses/:course_id/reports/latest', (req, res, ctx) => {
    const { course_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js adminReportHistory
  rest.get(
    '/api/admin/reports/account/:account_id/term/{term}',
    (req, res, ctx) => {
      const { account_id, term_id } = req.params

      return res(ctx.status(200), ctx.json({}))
    }
  ),
  // Api.js adminUser
  rest.get('/api/admin/users', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  // Api.js scanContent
  rest.get('/api/sync/content/:content_id', (req, res, ctx) => {
    const { content_id } = req.params

    return res(ctx.status(200), ctx.json({}))
  }),
]
