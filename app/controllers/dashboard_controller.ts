import type { HttpContext } from '@adonisjs/core/http'
import Annonce from '../models/annonce.js'
import Message from '../models/message.js'

type GetConversationsDemandeResponse = {
  fullName: string
  userId: number
  annonceId: string
  annonceTitle: string
  lastMessage?: string
  lastMessageDate?: string
}

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

    const conversations = await this.getConversations(auth.user?.id || 0)

    return view.render('pages/dashboard', { annonces: annonces, conversations: conversations })
  }

  // Retourne les discussions ouvertes à l'utilisateur qui publie une annonce
  private async getConversations(userId: number): Promise<GetConversationsDemandeResponse[]> {
    let messages = await Message.query()
      .where((query) => {
        query.where('senderId', userId).orWhere('receiverId', userId)
      })
      .whereHas('annonce', (annonceQuery) => {
        annonceQuery.where('authorId', userId)
      })
      .preload('annonce')
      .preload('sender')
      .preload('receiver')
      .orderBy('createdAt', 'desc')
      .debug(true)

    // Garder uniquement couple utilisateur-annonce unique
    const uniqueConversations: { [key: string]: Message } = {}
    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId
      const key = `${otherUserId}-${message.annonceId}`
      if (!uniqueConversations[key]) {
        uniqueConversations[key] = message
      }
    })

    // Construire la réponse
    const conversations: GetConversationsDemandeResponse[] = []
    for (const key in uniqueConversations) {
      const message = uniqueConversations[key]
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId

      let fullName: string | null = ''
      if (message.senderId === userId) {
        fullName = message.receiver.fullName
      } else {
        fullName = message.sender.fullName
      }

      if (!fullName) {
        continue
      }

      conversations.push({
        fullName: fullName,
        userId: otherUserId,
        annonceId: message.annonceId,
        annonceTitle: message.annonce.title,
        lastMessage: message.contenu,
        lastMessageDate: message.createdAt.toFormat('dd/MM/yyyy HH:mm'),
      })
    }
    return conversations
  }
}
