import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('contenu').notNullable()

      // Foreign keys pour les deux utilisateurs (expéditeur et destinataire)
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Foreign key vers l'annonce
      table.string('annonce_id').references('id').inTable('annonces').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
