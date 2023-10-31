require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3333;

const uri = process.env.MONGODB_URI;

// Conecte-se ao banco de dados MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');
    return client.db(); // Retorna o objeto de banco de dados
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados', error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.get('/test-connection', async (req, res) => {
  try {
    const db = await connectToDatabase(); // Conexão com o banco de dados
    const collection = db.collection('users'); // Substitua 'suaColecao' pelo nome da sua coleção
    
    // Execute uma operação de busca simples para verificar a conexão
    const result = await collection.findOne({}); // Buscar um documento qualquer

    // Se a consulta for bem-sucedida, retornar o resultado como JSON
    res.json({ message: 'Conexão com o banco de dados bem-sucedida', data: result });
  } catch (error) {
    console.error('Erro na conexão com o banco de dados', error);
    res.status(500).json({ message: 'Erro na conexão com o banco de dados' });
  }
});
