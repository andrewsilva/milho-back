const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK usando sua chave de serviço
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://milho-c89cb-default-rtdb.firebaseio.com/' // Substitua 'SEU_PROJETO' pelo ID do seu projeto Firebase
});

// Defina o usuário como admin baseado no e-mail
function setAdminByEmail(email) {
  admin.auth().getUserByEmail(email)
    .then(userRecord => {
      // Verifique se o usuário já é um admin
      if (userRecord.customClaims && userRecord.customClaims.admin) {
        console.log(`O usuário ${email} já é um administrador.`);
        return;
      }

      // Defina a custom claim 'admin' para true
      return admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    })
    .then(() => {
      console.log(`O usuário ${email} foi definido como administrador.`);
    })
    .catch(error => {
      console.error(`Erro ao definir o usuário como administrador: ${error}`);
    });
}

setAdminByEmail('andrew.keizze@gmail.com'); // Substitua 'EMAIL_DO_USUARIO_ADMIN' pelo e-mail do usuário que você deseja designar como administrador.
