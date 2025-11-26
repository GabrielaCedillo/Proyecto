const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // mostrar lista
    router.get('/', (req, res) => {
        const consulta = 'SELECT * FROM users';
        db.query(consulta, (err, results) => {
            if (err) {
                console.error('error al obtener usuarios', err);
                res.send('Error, no hay datos');
            } else {
                const loggedIn = req.session && req.session.userId ? true : false;
                const userName = req.session && req.session.userName ? req.session.userName : '';

                res.render('index', {
                    users: results,
                    loggedIn: loggedIn,
                    userName: userName
                });
            }
        });
    });

    
    
    // eliminar 
    router.get('/delete/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).send('ID inválido');

        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], (err) => {
            if (err) {
                console.error('Error al eliminar user:', err);
                return res.status(500).send('Error al eliminar usuario');
            }
            return res.redirect('/');
        });
    });




    // agregar 
    router.post('/add', (req, res) => {
        const name = (req.body.name).trim();
        const email = (req.body.email).trim();

        if (!name || !email) {
            return res.status(400).send('Se requieren Nombre y Correo');
        }

        const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
        db.query(sql, [name, email], (err, result) => {
            if (err) {
                console.error('Error al insertar', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('El correo ya esta registrado');
                }
                return res.status(500).send('Error al agregar usuario');
            }
            return res.redirect('/');
        });
    });

    
    
    // formulario para editar
    router.get('/edit/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).send('ID inválido');

        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Erro de obtencion', err);
                return res.status(500).send('Error al obtener usuario');
            }
            if (!results.length) return res.status(404).send('Usuario no encontrado');
            return res.render('edit', { user: results[0] });
        });
    });

    // procesar edición
    router.post('/edit/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        const name = (req.body.name || '').trim();
        const email = (req.body.email || '').trim();
        if (Number.isNaN(id) || !name || !email) return res.status(400).send('Datos inválidos');

        const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
        db.query(sql, [name, email, id], (err) => {
            if (err) {
                console.error('Error al actualizar', err);
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('El correo ya está registrado');
                return res.status(500).send('Error al actualizar usuario');
            }
            return res.redirect('/');
        });
    });

    // formulario de login
    router.get('/login', (req, res) => {
        res.render('login');
    });

    // procesar login
    router.post('/login', (req, res) => {
        const email = (req.body.email || '').trim();
        const password = (req.body.password || '').trim();

        if (!email || !password) {
            return res.status(400).send(' Se requiren Correo y contraseña');
        }

        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            if (err) {
                console.error('Error de inicio de sesión', err);
                return res.status(500).send('Error en el servidor');
            }
            if (!results.length) {
                return res.status(401).send('Correo o contraseña incorrectos');
            }
            req.session.userId = results[0].id;
            req.session.userName = results[0].name;
            res.redirect('/');
        });
    });

    // mostrar formulario de registro
    router.get('/register', (req, res) => {
        res.render('register');
    });

    // procesar registro
    router.post('/register', (req, res) => {
        const name = (req.body.name || '').trim();
        const email = (req.body.email || '').trim();
        const password = (req.body.password || '').trim();

        if (!name || !email || !password) {
            return res.status(400).send('Se requiren Nombre, Correo y Contraseña');
        }

        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, password], (err) => {
            if (err) {
                console.error('Error de registro', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('Este correo ya esta registrado');
                }
                return res.status(500).send('Error de registro, Intente de nuevo');
            }
            res.redirect('/login');
        });
    });

    
    
    // cerrar sesión
    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) return res.send('Error al cerrar sesión');
            res.redirect('/');
        });
    });

    return router;
};