const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
const app = express();
//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
// formulario
app.use(bodyParser.urlencoded({extended:false}));
app.set('view engine','ejs');

// configuracion de la base de datos
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'12345',
    database:'crud',
    port:'3306'
});

// validacion de la base de datos 
db.connect(err=>{
    if(err){
        console.error('ocurrió un error con el servidor: ',err);
    }else{
        console.log('Server no llama feliz');
    }
});

// routes
app.use(routes(db));

// servidor
const port = 3009;
app.listen(port,()=>{
    console.log(`server desde http://127.0.0.1:${port}`);
});