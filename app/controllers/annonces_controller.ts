import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import Annonce from '../models/annonce.js'
import Avis from '../models/avis.js'

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
    await cover.move('./storage/uploads', {
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

  async showAnnonce({ params, view, response, auth }: HttpContext) {
    const annonce = await Annonce.query()
      .preload('author')
      .preload('avis', (qb) => {
        qb.preload('user')
      })
      .where('id', params.id)
      .first()

    if (!annonce) {
      return response.notFound('Annonce non trouvée')
    }

    // On calcule la note moyenne
    const avisAnnonce = annonce.avis
    if (avisAnnonce.length > 0) {
      const totalNotes = avisAnnonce.reduce((sum, avis) => sum + avis.note, 0)
      ;(annonce as any).averageRating = (totalNotes / avisAnnonce.length).toFixed(1).toString()
    } else {
      ;(annonce as any).averageRating = '?'
    }

    const userId = auth.user ? auth.user.id : -1

    // Vérifier si l'utilisateur connecté a déjà laissé un avis
    let hasAvisFromUser = false
    for (const avis of annonce.avis) {
      if (avis.userId === userId) {
        hasAvisFromUser = true
        break
      }
    }

    return view.render('pages/annonce', { annonce, hasAvisFromUser })
  }

  async search({ request, view }: HttpContext) {
    // ?type=bien&description=aa&location=64000
    const { type, description, location, sortBy } = request.qs()

    let query = Annonce.query()
      .preload('author')
      .preload('avis', (qb) => {
        qb.preload('user')
      })
      .where('isActive', true)

    if (type) {
      query = query.where('category', type)
    }

    if (description) {
      query = query.where('description', 'like', `%${description}%`)
    }

    if (location) {
      query = query.where('location', location)
    }

    switch (sortBy) {
      case 'price_asc':
        query = query.orderBy('cost', 'asc')
        break
      case 'price_desc':
        query = query.orderBy('cost', 'desc')
        break
      case 'newest':
        query = query.orderBy('createdAt', 'desc')
        break
      case 'oldest':
        query = query.orderBy('createdAt', 'asc')
        break
      default:
        // No sorting
        break
    }

    const annonces = await query.exec()

    for (const annonce of annonces) {
      // On calcule la note moyenne
      const avisAnnonce = annonce.avis
      if (avisAnnonce.length > 0) {
        const totalNotes = avisAnnonce.reduce((sum, avis) => sum + avis.note, 0)
        ;(annonce as any).averageRating = (totalNotes / avisAnnonce.length).toFixed(1).toString()
      } else {
        ;(annonce as any).averageRating = '?'
      }
    }

    return view.render('pages/search_results', {
      annonces,
      searchParams: { type, description, location, sortBy: sortBy ? sortBy : 'price_asc' },
    })
  }

  async newReviewPage({ params, view, response }: HttpContext) {
    const annonce = await Annonce.query().where('id', params.id).first()

    if (!annonce) {
      return response.notFound('Annonce non trouvée')
    }

    return view.render('pages/new_review', { annonce })
  }

  async createReview({ params, request, response, auth }: HttpContext) {
    const annonce = await Annonce.query().where('id', params.id).first()

    if (!annonce) {
      return response.notFound('Annonce non trouvée')
    }

    const { note, commentaire } = request.only(['note', 'commentaire'])

    await Avis.create({
      annonceId: annonce.id,
      userId: auth.user!.id,
      note,
      commentaire,
    })

    return response.redirect(`/annonce/${annonce.id}`)
  }
}
