import type { HttpContext } from '@adonisjs/core/http'
import Annonce from '../models/annonce.js'

export default class DashboardController {
  async index({ view, auth }: HttpContext) {
    const annonces = await Annonce.query()
      .preload('author')
      .orderBy('createdAt', 'desc')
      .where('authorId', '=', auth.user?.id || 0)
    return view.render('pages/dashboard', { annonces: annonces })
  }
}
