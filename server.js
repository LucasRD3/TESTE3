const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000; 
const SECRET_KEY = "sua_chave_secreta_aqui"; // Em produção, use variáveis de ambiente

const MONGO_URI = "mongodb+srv://LucasRD3:Lc9711912%40@cluster0.hjbuhjv.mongodb.net/?appName=Cluster0";

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
    .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Esquemas
const TransacaoSchema = new mongoose.Schema({
    descricao: String,
    valor: Number,
    tipo: String,
    data: String
});

const UserSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true }
});

const Transacao = mongoose.model('Transacao', TransacaoSchema);
const User = mongoose.model('User', UserSchema);

// Middleware para verificar Token
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "Token não fornecido" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.userId = decoded.id;
        next();
    });
};

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;

    // Usuário fixo solicitado: IADEV / 1234
    // Em um sistema real, você buscaria no banco: await User.findOne({ usuario });
    if (usuario === "IADEV" && senha === "1234") {
        const token = jwt.sign({ id: usuario }, SECRET_KEY, { expiresIn: '24h' });
        return res.json({ auth: true, token });
    }

    res.status(401).json({ error: "Usuário ou senha inválidos" });
});

// Rotas Protegidas
app.get('/api/transacoes', verificarToken, async (req, res) => {
    try {
        const transacoes = await Transacao.find();
        res.json(transacoes);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar dados no banco" });
    }
});

app.post('/api/transacoes', verificarToken, async (req, res) => {
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

app.put('/api/transacoes/:id', verificarToken, async (req, res) => {
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

app.delete('/api/transacoes/:id', verificarToken, async (req, res) => {
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
