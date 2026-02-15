const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
// Porta dinâmica para o Render
const PORT = process.env.PORT || 3000; 

// String de conexão com URL Encoding para o caractere @
const MONGO_URI = "mongodb+srv://LucasRD3:Lc9711912%40@cluster0.hjbuhjv.mongodb.net/?appName=Cluster0";

// Configuração de CORS: Essencial para permitir que o seu Index.html local aceda a este servidor
app.use(cors());
app.use(bodyParser.json());

// Conexão com o MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
    .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Esquema de dados
const TransacaoSchema = new mongoose.Schema({
    descricao: String,
    valor: Number,
    tipo: String,
    data: String
});

const Transacao = mongoose.model('Transacao', TransacaoSchema);

// --- ROTAS DA API ---

// Listar transações
app.get('/api/transacoes', async (req, res) => {
    try {
        const transacoes = await Transacao.find();
        res.json(transacoes);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar dados no banco" });
    }
});

// Criar transação
app.post('/api/transacoes', async (req, res) => {
    try {
        const novaTransacao = new Transacao({
            descricao: req.body.descricao,
            valor: parseFloat(req.body.valor),
            tipo: req.body.tipo,
            data: req.body.dataManual
        });

        await novaTransacao.save();
        res.status(201).json(novaTransacao);
    } catch (err) {
        res.status(500).json({ error: "Erro ao salvar no banco" });
    }
});

// Atualizar transação
app.put('/api/transacoes/:id', async (req, res) => {
    try {
        const transacaoAtualizada = await Transacao.findByIdAndUpdate(
            req.params.id,
            {
                descricao: req.body.descricao,
                valor: parseFloat(req.body.valor),
                tipo: req.body.tipo,
                data: req.body.dataManual
            },
            { new: true }
        );
        res.json(transacaoAtualizada);
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar no banco" });
    }
});

// Eliminar transação
app.delete('/api/transacoes/:id', async (req, res) => {
    try {
        await Transacao.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erro ao excluir do banco" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor API online na porta ${PORT}`);
});