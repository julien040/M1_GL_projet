mkdir tmp
echo TZ=UTC \
PORT=3333 \
HOST=localhost\
LOG_LEVEL=info\
APP_KEY=DScramVeY4c4Qf2XsTOy1KcWyXwN7vTo\
NODE_ENV=development\
SESSION_DRIVER=cookie > .env

echo "Fichier .env cree avec succes."

mkdir -p tmp
mkdir -p storage/uploads

npm install

node ace generate:key

echo "Cle d'application generee avec succes."

node ace migration:run