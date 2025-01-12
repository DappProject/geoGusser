import express from "express";
import cors from "cors"



const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended : true
}))
app.use('/public', express.static('public'));

app.set("view engine", "ejs")

app.use(cors({
  origin : 'https://geo-gusser-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true 
}))



app.get("/form", function(req, res){
    res.render("form")
})
app.get("/",function(req,res){
    res.send("run ")
})
app.get("/view", function(req, res){
    res.render("view")
})

import searchRouter from './routes/search.routes.js'

app.use("/api/v1/geoGuess", searchRouter)

// Set up multer to store files with custom file names


// Handle file upload and image processing


// Your Google Cloud API key




export { app };
