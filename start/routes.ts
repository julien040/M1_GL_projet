import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.on('/').render('pages/home')
router.get('/login', '#controllers/login_controller.loginPage').use(middleware.guest())
router.post('/login', '#controllers/login_controller.login').use(middleware.guest())
router.get('/register', '#controllers/login_controller.registerPage').use(middleware.guest())
router.post('/register', '#controllers/login_controller.register').use(middleware.guest())
router
  .group(() => {
    router.get('/', '#controllers/dashboard_controller.index')
  })
  .prefix('/dashboard')
  .use(middleware.auth())
