import { test } from '@japa/runner'

import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User', (group) => {
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
})
