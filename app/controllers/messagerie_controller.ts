import type { HttpContext } from '@adonisjs/core/http'
import Annonce from '../models/annonce.js'
import Message from '../models/message.js'
import User from '../models/user.js'
import { randomInt } from 'node:crypto'
import { notifyNewMessageEmail } from './email.js'

export default class MessagerieController {
  async conversation({ view, params, auth }: HttpContext) {
    const userId = auth.user?.id || 0
    const { annonce, messages, chatUser } = await this.getMessageCollection(params.id, userId)

    return view.render('pages/messagerie', { annonce, chatUser, messages })
  }

  async sendNotificationEmail(
    userIdSender: number,
    userIdReceiver: number,
    annonceTitle: string,
    messageContent: string
  ) {
    const receiver = await User.findByOrFail('id', userIdReceiver)
    const receiverEmail = receiver.email
    const sender = await User.findByOrFail('id', userIdSender)
    const senderFullName = sender.fullName

    if (!receiverEmail) {
      return
    }

    if (!senderFullName) {
      return
    }

    await notifyNewMessageEmail(receiverEmail, senderFullName, annonceTitle, messageContent)
  }

  async conversationDashboard({ view, params }: HttpContext) {
    const { annonce, messages } = await this.getMessageCollection(params.annonceId, params.userId)

    const otherUserId = params.userId
    const chatUser = await User.findByOrFail('id', otherUserId)

    return view.render('pages/messagerie_dashboard', { annonce, chatUser, messages })
  }

  async createMessageDashboard({ params, request, auth, response }: HttpContext) {
    const userId = auth.user?.id || 0
    const annonceID = params.annonceId
    const otherUserId = params.userId
    const content = request.input('content')

    const message = new Message()
    message.id = randomInt(1, 1000000)
    message.senderId = userId
    message.receiverId = otherUserId
    message.contenu = content
    message.annonceId = annonceID
    await message.save()

    const annonce = await Annonce.query().where('id', annonceID).firstOrFail()

    await this.sendNotificationEmail(userId, otherUserId, annonce.title, content)

    return response.redirect(`/dashboard/messagerie/${annonceID}/${otherUserId}`)
  }

  async createMessageUser({ params, request, auth, response }: HttpContext) {
    const userId = auth.user?.id || 0
    const annonceID = params.id
    const content = request.input('content')

    const annonce = await Annonce.query().where('id', annonceID).firstOrFail()
    const authorID = annonce.authorId

    const message = new Message()
    message.id = randomInt(1, 1000000)
    message.senderId = userId
    message.receiverId = authorID
    message.contenu = content
    message.annonceId = annonceID
    await message.save()

    await this.sendNotificationEmail(userId, authorID, annonce.title, content)

    return response.redirect(`/annonce/${annonceID}/messagerie`)
  }

  private async getMessageCollection(annonceId: string, userId: number) {
    const annonce = await Annonce.query().where('id', annonceId).firstOrFail()
    const authorID = annonce.authorId

    const messages = await Message.query()
      .where((query) => {
        query
          .where('senderId', userId)
          .andWhere('receiverId', authorID)
          .andWhere('annonceId', annonceId)
      })
      .orWhere((query) => {
        query
          .where('senderId', authorID)
          .andWhere('receiverId', userId)
          .andWhere('annonceId', annonceId)
      })
      .orderBy('createdAt', 'asc')

    const chatUser = await User.findByOrFail('id', authorID)

    return { annonce, messages, chatUser }
  }
}
