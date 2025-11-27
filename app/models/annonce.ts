import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Annonce extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => User)
  declare author: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ENUM heure/jour/mois/an
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

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
