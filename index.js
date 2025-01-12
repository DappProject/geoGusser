import dotenv from "dotenv"
import {app} from "./app.js"


dotenv.config({
    path : "./.env"
})

// Start the server

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});