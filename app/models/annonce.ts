import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, belongsTo } from '@adonisjs/lucid/orm'
import type { HasOne, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Annonce extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare authorId: number

  @belongsTo(() => User, {
    foreignKey: 'authorId', // Pointing to the column you just added
  })
  declare author: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ENUM heure/jour/mois/an/unite
  @column()
  declare durationType: string

  @column()
  declare cost: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare isActive: boolean

  // ENUM bien/service
  @column()
  declare category: string

  // Code postal
  @column()
  declare location: string

  @column()
  declare imagePath: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
