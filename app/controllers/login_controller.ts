import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@adonisjs/auth'

export default class LoginController {
  async login({ request, auth, response, view }: HttpContext) {
    console.log('Login attempt')
    logger.info('Login attempt')
    try {
      /**
       * Step 1: Get credentials from the request body
       */
      const { email, password } = request.only(['email', 'password'])
      console.log(email, password)

      /**
       * Step 2: Verify credentials
       */
      const user = await User.verifyCredentials(email, password)
      console.log(user)

      /**
       * Step 3: Login user
       */
      await auth.use('web').login(user)
      console.log('User logged in')

      /**
       * Step 4: Send them to a protected route
       */
      response.redirect('/dashboard')
      console.log('Redirecting to /dashboard')
    } catch (error) {
      console.log('Something happened', error)
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        return view.render('pages/login', {
          error: 'Email/mot de passe incorrect. Veuillez réessayer.',
        })
      }
      return view.render('pages/login', {
        error: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      })
    }
  }

  async register({ request, auth, response, view }: HttpContext) {
    try {
      /**
       * Step 1: Get user details from the request body
       */
      const { email, password, fullname } = request.only(['email', 'password', 'fullname'])

      /**
       * Step 2: Create new user
       */
      const user = await User.create({
        email,
        password,
        fullName: fullname,
      })

      /**
       * Step 3: Login user
       */
      await auth.use('web').login(user)

      /**
       * Step 4: Send them to a protected route
       */
      response.redirect('/dashboard')
    } catch (error) {
      console.log('Registration error', error)
      return view.render('pages/register', {
        error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard.",
      })
    }
  }

  async loginPage({ view }: HttpContext) {
    return view.render('pages/login')
  }

  async registerPage({ view }: HttpContext) {
    return view.render('pages/register')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect('/')
  }
}
