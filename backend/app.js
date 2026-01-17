const express=require("express")
const db = require('./db/db');
const Routes = require('./routes/routes');
const app = express()
require('dotenv').config();
const PORT = process.env.PORT 
const bodyparser = require('body-parser');



db();
app.use(bodyparser.json());
app.use('/api' ,Routes)



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
