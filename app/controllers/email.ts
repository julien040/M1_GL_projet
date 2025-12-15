import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function notifyNewMessageEmail(
  receiverEmail: string,
  senderFullName: string,
  annonceTitle: string,
  messageContent: string
) {
  await resend.emails.send({
    from: 'bonjour@indirent.julienc.me',
    to: receiverEmail,
    subject: `Nouveau message de ${senderFullName} concernant "${annonceTitle}"`,
    template: {
      id: 'indirent-notif',
      variables: {
        FULL_NAME: senderFullName,
        TITLE: annonceTitle,
        MESSAGE: messageContent,
      },
    },
  })

  console.log('Notification email envoyée à', receiverEmail)
}
