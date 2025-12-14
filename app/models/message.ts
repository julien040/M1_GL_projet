import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Annonce from './annonce.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare contenu: string

  @column()
  declare senderId: number

  @column()
  declare receiverId: number

  @column()
  declare annonceId: string

  @belongsTo(() => User, {
    foreignKey: 'senderId',
  })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'receiverId',
  })
  declare receiver: BelongsTo<typeof User>

  @belongsTo(() => Annonce, {
    foreignKey: 'annonceId',
  })
  declare annonce: BelongsTo<typeof Annonce>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
