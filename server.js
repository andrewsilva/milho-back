const express = require("express");
const database = require("./firebaseConfig");
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const bodyParser = require('body-parser'); // Importe o módulo body-parser


const app = express();

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://milho-c89cb-default-rtdb.firebaseio.com/"
});

const db = admin.database();

app.get("/is-admin", (req, res) => {
  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).send("UID é necessário");
  }

  admin.auth().getUser(uid)
    .then(userRecord => {
      const isAdmin = userRecord.customClaims && userRecord.customClaims.admin;
      res.status(200).json({ isAdmin });
    })
    .catch(error => {
      res.status(500).send(`Erro ao verificar admin: ${error.message}`);
    });
});

app.use(bodyParser.urlencoded({ extended: true }));

// Rota para lidar com o envio do formulário
app.post('/api/incluir-formulario', async (req, res) => {
  try {
    const db = admin.database();
    const formularioRef = db.ref('apoios'); // Substitua 'formularios' pelo caminho/nó desejado

    // Extrair os dados do formulário da solicitação POST
    const { position, village, url, lancas, espadas, arqueiros } = req.body;


    // Verificar se os dados necessários estão presentes
    if (!position || !village || !url || !lancas || !espadas || !arqueiros) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const encodedUrl = encodeURIComponent(url);
    // Criar um objeto com os dados do formulário
    const novoFormulario = {
      position,
      village,
      url: encodedUrl,
      lancas: parseInt(lancas), // Converter para número
      espadas: parseInt(espadas), // Converter para número
      arqueiros: parseInt(arqueiros) // Converter para número
    };


    // Adicionar os dados do formulário ao nó 'formularios' no Realtime Database
    const novoFormularioRef = formularioRef.push();
    await novoFormularioRef.set(novoFormulario);

    res.status(201).json({ message: 'Formulário incluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao incluir o formulário no banco de dados Firebase Realtime:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação.' });
  }
});

app.get('/api/listar-formularios', async (req, res) => {
  try {
    const db = admin.database();
    const formularioRef = db.ref('apoios'); // Substitua 'apoios' pelo caminho/nó desejado

    formularioRef.once('value', (snapshot) => {
      const data = snapshot.val();

      if (!data) {
  res.status(404).json({ error: 'Nenhum dado encontrado.' });
  return;
}

const formDataWithIds = Object.keys(data).map((key) => ({
  id: key, // O ID do documento é a chave/nó do Firebase
  ...data[key], // Os dados do documento
}));

formDataWithIds.sort((a, b) => a.position - b.position);

      res.status(200).json(formDataWithIds);
    });
  } catch (error) {
    console.error('Erro ao listar os formulários do banco de dados Firebase Realtime:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação.' });
  }
});


app.post('/api/deduzir-formulario/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const formularioDeduzir = req.body;

    console.log('form deduzir', formularioDeduzir);
    console.log('id', id);

    // Consulte o documento pelo ID no Firebase Realtime Database
    const formularioRef = db.ref('apoios'); // Substitua 'apoios' pelo caminho/nó desejado

    formularioRef.child(id).once('value', async (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Verifique se há recursos suficientes para dedução
        if (
          data.lancas >= formularioDeduzir.lancas &&
          data.espadas >= formularioDeduzir.espadas &&
          data.arqueiros >= formularioDeduzir.arqueiros
        ) {
          // Faça as deduções no Firebase Realtime Database
          await formularioRef.child(id).update({
            lancas: data.lancas - formularioDeduzir.lancas,
            espadas: data.espadas - formularioDeduzir.espadas,
            arqueiros: data.arqueiros - formularioDeduzir.arqueiros,
          });

          // Envie uma resposta adequada, como um status de sucesso e os dados atualizados
          res.status(200).json({ message: 'Valores deduzidos com sucesso!' });
        } else {
          console.error('Recursos insuficientes para dedução');
          res.status(400).json({ error: 'Recursos insuficientes para dedução' });
        }
      } else {
        console.error('Formulário não encontrado para dedução');
        res.status(404).json({ error: 'Formulário não encontrado para dedução' });
      }
    });
  } catch (error) {
    console.error('Erro ao deduzir valores:', error);
    res.status(500).json({ error: 'Erro ao deduzir valores' });
  }
});

app.delete('/api/excluir-formulario/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Consulte o documento pelo ID no Firebase Realtime Database
    const formularioRef = db.ref('apoios'); // Substitua 'apoios' pelo caminho/nó desejado

    formularioRef.child(id).once('value', async (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Exclua o documento do Firebase Realtime Database
        await formularioRef.child(id).remove();

        // Envie uma resposta adequada, como um status de sucesso
        res.status(200).json({ message: 'Registro excluído com sucesso!' });
      } else {
        console.error('Registro não encontrado para exclusão');
        res.status(404).json({ error: 'Registro não encontrado para exclusão' });
      }
    });
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});





function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization; 
  if (bearerHeader) {
    const token = bearerHeader.split(' ')[1]; // Supondo "Bearer TOKEN_DO_USUARIO"
    
    admin.auth().verifyIdToken(token)
        .then(claims => {
            if (claims.admin) {
                next(); // Continue para a próxima função (rotas)
            } else {
                res.status(403).send('Acesso não permitido');
            }
        })
        .catch(error => {
            res.status(401).send('Token inválido');
        });
  } else {
    res.status(403).send('Token não fornecido');
  }
}

app.post("/adicionar", verifyToken, (req, res) => { 
  const { chave, valor } = req.body;

  database.ref(`dados/${chave}`).set(valor)
    .then(() => {
      res.status(200).send("Dado adicionado com sucesso!");
    })
    .catch((erro) => {
      res.status(500).send(`Erro ao adicionar dado: ${erro.message}`);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
