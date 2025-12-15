import { test } from '@japa/runner'

import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import Annonce from '../../app/models/annonce.js'
import { randomInt } from 'node:crypto'

test.group('User', (group) => {
  console.log('Début du groupe de tests User')
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test("les mots de passe sont hachés lors de la création d'un nouvel utilisateur", async ({
    assert,
  }) => {
    const user = new User()
    user.password = 'secret'
    user.email = 'john.doe@example.com'
    user.fullName = 'John Doe'

    await user.save()

    assert.isTrue(hash.isValidHash(user.password))
    assert.isTrue(await hash.verify(user.password, 'secret'))

    // Clean up
    await user.delete()
  })

  test("Création d'annonce", async ({ assert }) => {
    // Créer deux utilisateurs
    const author = await User.create({
      email: 'author@example.com',
      password: 'password123',
      fullName: 'Jean Dupont',
    })

    const sender = await User.create({
      email: 'sender@example.com',
      password: 'password123',
      fullName: 'Marie Martin',
    })

    const annonce = new Annonce()
    annonce.id = `test-${randomInt(10000, 99999)}` // On tente de fournir un ID
    annonce.authorId = author.id
    annonce.title = 'Service de jardinage'
    annonce.description = 'Je propose mes services de jardinage'
    annonce.category = 'service'
    annonce.durationType = 'heure'
    annonce.cost = 15
    annonce.location = '75001'
    annonce.isActive = true
    annonce.imagePath = 'default.jpg'
    await annonce.save()

    // Vérifier que l'annonce a bien été créée
    assert.exists(annonce.id)
    assert.equal(annonce.authorId, author.id)

    // Vérifier que l'annonce est bien dans la BD
    const allAnnonces = await Annonce.all()
    console.log(
      'Annonces in DB:',
      allAnnonces.map((a) => ({ id: a.id, title: a.title }))
    )

    const foundAnnonce = await Annonce.find(annonce.id)
    console.log('Found annonce:', foundAnnonce)

    /*
    // Créer un message directement via raw query pour éviter les problèmes ORM
    await db.table('messages').insert({
      id: randomInt(1, 1000000),
      annonce_id: String(annonce.id),
      sender_id: sender.id,
      receiver_id: author.id,
      contenu: 'Bonjour, je suis intéressé par votre service',
      created_at: new Date(),
      updated_at: new Date(),
    })

    const message = await Message.query().where('annonceId', String(annonce.id)).first()
    if (!message) {
      assert.fail('Message not found in database')
      return
    }
    // Vérifier que le message existe
    assert.exists(message.id)
    assert.equal(message.senderId, sender.id)
    assert.equal(message.receiverId, author.id)
    assert.isTrue(message.contenu.includes('intéressé'))

    // Vérifier qu'on peut récupérer le message depuis la base de données
    const messages = await Message.query()
      .where('annonceId', annonce.id)
      .where('senderId', sender.id)
      .where('receiverId', author.id)

    assert.lengthOf(messages, 1)
    assert.equal(messages[0].id, message.id) 
    */
    // Clean up
    //await message?.delete()
    await annonce.delete()
    await sender.delete()
    await author.delete()
  })
})
