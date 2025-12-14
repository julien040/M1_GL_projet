import type { HttpContext } from '@adonisjs/core/http'
import Annonce from '../models/annonce.js'

export default class DashboardController {
  async index({ view, auth }: HttpContext) {
    const annonces = await Annonce.query()
      .preload('author')
      .preload('avis')
      .orderBy('createdAt', 'desc')
      .where('authorId', '=', auth.user?.id || 0)

    for (const annonce of annonces) {
      const avis1 = annonce.avis
      if (avis1.length > 0) {
        const totalRating = avis1.reduce((sum, avis) => sum + avis.note, 0)
        annonce.averageRating = (totalRating / avis1.length).toFixed(2)
      } else {
        annonce.averageRating = '?'
      }
    }
    return view.render('pages/dashboard', { annonces: annonces })
  }
}
