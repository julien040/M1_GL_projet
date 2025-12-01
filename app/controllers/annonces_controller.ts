import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import Annonce from '../models/annonce.js'

export default class AnnoncesController {
  async newPage({ view }: HttpContext) {
    return view.render('pages/new')
  }

  async createAnnonce({ request, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.badRequest({
        errors: ['Vous devez être authentifié'],
      })
    }

    console.log(request.body())

    const cover = request.file('cover', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    console.log(cover)

    const { title, type, description, prix, duration, location } = request.only([
      'title',
      'type',
      'description',
      'prix',
      'duration',
      'location',
    ])

    console.log(title, type, description, prix, duration, location)

    if (!cover) {
      return response.badRequest({
        errors: ['Une image de couverture doit être fournie'],
      })
    }

    if (!cover.isValid) {
      return response.badRequest({
        errors: cover.errors,
      })
    }

    const annonceID = cuid()
    await cover.move(app.makePath('storage/uploads'), {
      name: `cover-${annonceID}-${cuid()}.${cover.extname}`,
    })

    const annonce = await Annonce.create({
      title,
      description,
      category: type,
      cost: prix,
      durationType: duration,
      id: annonceID,
      imagePath: cover.fileName!,
      isActive: true,
      location: location,
      authorId: auth.user.id,
    })

    console.log('Annonce created:', annonce)

    return response.redirect('/dashboard')
  }
}
