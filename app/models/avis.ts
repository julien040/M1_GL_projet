import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Annonce from './annonce.js'

export default class Avis extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare annonceId: string

  @column()
  declare userId: number

  @column()
  declare note: number

  @column()
  declare commentaire: string

  @belongsTo(() => Annonce, {
    foreignKey: 'annonceId',
  })
  declare annonce: BelongsTo<typeof Annonce>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
