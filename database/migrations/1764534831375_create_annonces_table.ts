import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'annonces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Your columns
      table.string('duration_type') // ENUM stored as string
      table.float('cost') // Numbers are usually float or decimal
      table.string('title')
      table.text('description') // Text for longer content
      table.boolean('is_active').defaultTo(true)
      table.string('category') // ENUM stored as string
      table.string('location')
      table.string('image_path')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
