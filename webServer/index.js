/* Simple Express Skeleton */

/**
 * NPM Module Imports
 */
const express    =     require('express');
const bodyParser =     require("body-parser");
const path       =     require("path");
const cors       =     require("cors");

/**
 * App Variables
 */
const app = express();
const PORT = process.env.PORT || 54039


/**
 * App middlewares
 */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/resources')));

/**
 * Serve root webpage
 */
app.get('/',(request,response) => {
    response.contentType("text/html");
    response.sendFile('resources/index.html');
});

app.listen(PORT, () => console.log(`Server Started on port ${PORT} `));