const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./devwebii-c9696-firebase-adminsdk-7ux1q-3ed5b8682e.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async (req, res) =>{
    const pessoas = await db.collection('pessoas').get();
    const data = [];
    
    
    pessoas.forEach(doc => {
        data.push({
            id:doc.id,
            nome:doc.get('nome'),
            telefone:doc.get('telefone'),
            origem:doc.get('origem'),
            data_contato:doc.get('data_contato'),
            observacao:doc.get('observacao')

        })
    });
    res.render('consulta',{pessoas : data })
console.log({pessoas:data})

})

app.get('/editar/:id',async (req,res)=>{
    const docRef = db.collection('pessoas').doc(req.params.id)
    const doc = await docRef.get();
    if(!doc.exists){
      console.log("Nao encontrador")
      res.status(404).send("documento nao encontrado")
     
    }else{
      console.log(doc.data())
      res.render("editar", {id: req.params.id, agendamentos:doc.data()})
    }
  })
   
  app.post('/atualizar',async(req,res)=>{
    try{
      const docId = req.body.id;
      const docRef = db.collection('pessoas').doc(docId);
      await docRef.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      })
      res.redirect('/consulta')
    }catch{
      console.log("erro ao atualizar")
    }
  })
   
  app.get('/excluir/:id',async (req,res)=>{
    const docId = req.params.id;
    const pessoas = await db.collection('pessoas').doc(docId).delete();
    res.redirect('/consulta')
    })


app.post("/cadastrar", function(req, res){
    var result = db.collection('pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})


app.post("/atualizar", function(req, res){
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})