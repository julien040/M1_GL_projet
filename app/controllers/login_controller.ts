import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class LoginController {
  async index({ view, auth }: HttpContext) {
    return view.render('login', { annonces: {} })
  }
}
