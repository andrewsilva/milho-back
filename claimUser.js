const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK usando sua chave de serviço
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://milho-c89cb-default-rtdb.firebaseio.com/' // Substitua 'SEU_PROJETO' pelo ID do seu projeto Firebase
});

// Verifique as custom claims do usuário pelo e-mail
function checkClaimsByEmail(email) {
  admin.auth().getUserByEmail(email)
    .then(userRecord => {
      // Exiba as custom claims do usuário
      console.log(`Custom claims para ${email}:`, userRecord.customClaims);
    })
    .catch(error => {
      console.error(`Erro ao buscar o usuário: ${error}`);
    });
}

checkClaimsByEmail('drk1@drk1.com'); // Substitua 'EMAIL_DO_USUARIO_ADMIN' pelo e-mail do usuário que você deseja verificar.
