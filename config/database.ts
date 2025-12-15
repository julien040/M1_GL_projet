import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'sqlite',
  prettyPrintDebugQueries: true,
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: './tmp/db.sqlite3',
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
