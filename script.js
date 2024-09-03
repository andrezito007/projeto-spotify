document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const playlistForm = document.getElementById('playlist-form');
    const playlistResult = document.getElementById('playlist-result');

    if (userForm) {
        userForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const name = document.getElementById('name').value;
            const genre = document.getElementById('genre').value.split(',').map(g => g.trim());
            const artist = document.getElementById('artist').value.split(',').map(a => a.trim());
            const songs = document.getElementById('songs').value.split(',').map(s => s.trim());

            try {
                const response = await fetch('/api/music/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, preferences: { genre, artist, songs } })
                });

                const result = await response.json();
                alert('Usuário cadastrado com sucesso!');
                userForm.reset();
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao cadastrar usuário.');
            }
        });
    }

    if (playlistForm) {
        playlistForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const location = document.getElementById('location').value;

            try {
                const response = await fetch(`/api/sensors/playlists/custom?location=${location}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                const playlist = await response.json();
                playlistResult.innerHTML = `
                    <h4>${playlist.name}</h4>
                    <p>${playlist.description}</p>
                    <ul>
                        ${playlist.songs.map(song => `<li>${song}</li>`).join('')}
                    </ul>
                `;
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao criar playlist.');
            }
        });
    }
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/music_personalization', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Definir esquemas e modelos
const userSchema = new mongoose.Schema({
    name: String,
    preferences: {
        genre: [String],
        artist: [String],
        songs: [String]
    }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());

// Rota para criar um usuário
app.post('/api/music/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao salvar o usuário:', error);
        res.status(400).send({ error: 'Erro ao cadastrar usuário' });
    }
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

