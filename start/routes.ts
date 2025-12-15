import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'

router.on('/').render('pages/home')
router.get('/login', '#controllers/login_controller.loginPage').use(middleware.guest())
router.post('/login', '#controllers/login_controller.login').use(middleware.guest())
router.get('/register', '#controllers/login_controller.registerPage').use(middleware.guest())
router.post('/register', '#controllers/login_controller.register').use(middleware.guest())
router.get('/logout', '#controllers/login_controller.logout').use(middleware.auth())
router
  .group(() => {
    router.get('/', '#controllers/dashboard_controller.index')
    router.get(
      '/messagerie/:annonceId/:userId',
      '#controllers/messagerie_controller.conversationDashboard'
    )
    router.post(
      '/messagerie/:annonceId/:userId/newMessage',
      '#controllers/messagerie_controller.createMessageDashboard'
    )
  })
  .prefix('/dashboard')
  .use(middleware.auth())
router.get('/new', '#controllers/annonces_controller.newPage').use(middleware.auth())
router.post('/new', '#controllers/annonces_controller.createAnnonce').use(middleware.auth())
router.get('/annonce/:id', '#controllers/annonces_controller.showAnnonce')
router
  .get('/annonce/:id/newReview', '#controllers/annonces_controller.newReviewPage')
  .use(middleware.auth())
router
  .post('/annonce/:id/newReview', '#controllers/annonces_controller.createReview')
  .use(middleware.auth())
router
  .get('/annonce/:id/messagerie', '#controllers/messagerie_controller.conversation')
  .use(middleware.auth())
router
  .post('/annonce/:id/newMessage', '#controllers/messagerie_controller.createMessageUser')
  .use(middleware.auth())
router.get('/search', '#controllers/annonces_controller.search')

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('storage/uploads', normalizedPath)
  return response.download(absolutePath)
})
