import searchRouter from './src/routes/search.routes.js'
import express from "express";
import cors from "cors"



const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use('/public', express.static('public'));

app.set("view engine", "ejs")

app.use(cors({
    origin: [
        'http://45.154.98.112'   // Example for development (Vite default port)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", [
        'http://45.154.98.112'    // Example for development (Vite default port)
    ]);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


app.get("/form", function (req, res) {
    res.render("form")
})
app.get("/", function (req, res) {
    res.send("run ")
})
app.get("/view", function (req, res) {
    res.render("view")
})


app.use("/api/v1/geoGuess", searchRouter)

// Set up multer to store files with custom file names


// Handle file upload and image processing


// Your Google Cloud API key




export { app };
