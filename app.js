const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const hbs = require('express-handlebars');
const exphbs = hbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'), // Register partials directory
    extname: '.hbs',
    helpers: {
        hasMetascore: (score) => score !== "",
        isMetascoreBlank: (score) => score === "" || score === "N/A",
        highlightIfBlank: (score) => {
            return score === "" || score === "N/A" ? 'highlight' : '';
        }
    }
});




// Set up the Express app
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', exphbs.engine); // Register the Handlebars engine
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', 'hbs'); // Set the view engine to hbs

// Home route
app.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

// Users route
app.get('/users', function(req, res) {
    res.send('respond with a resource');
});

// Route to display the form for searching by movie ID
app.get('/data/search/id', (req, res) => {
    res.render('pages/searchById');
});

// Handle movie ID search
app.get('/data/search/id/result', (req, res) => {
    const movieId = parseInt(req.query.movie_id);
    
    fs.readFile(path.join(__dirname, 'movieData', 'movieData.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).render('error', { error: "Internal Server Error" });
        
        const moviesData = JSON.parse(data);
        const movie = moviesData.find(m => m.Movie_ID === movieId);
        
        res.render('pages/resultById', { movie });
    });
});

// Route to display the form for searching by movie title
app.get('/data/search/title', (req, res) => {
    res.render('pages/searchByTitle');
});

// Handle search by movie title using req.query
app.get('/data/search/title/result', (req, res) => {
    const searchTitle = req.query.movie_title.toLowerCase(); // Using req.query

    fs.readFile(path.join(__dirname, 'movieData', 'movieData.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).render('error', { error: "Internal Server Error" });

        const moviesData = JSON.parse(data);
        const matchingMovies = moviesData.filter(movie => movie.Title.toLowerCase().includes(searchTitle));

        res.render('pages/resultByTitle', { movies: matchingMovies });
    });
});

// Step 7: Route to display all movie data
// Route to display all movie data
// app.get('/allData', (req, res) => {
//     fs.readFile(path.join(__dirname, 'movieData', 'movieData.json'), 'utf8', (err, data) => {
//         if (err) return res.status(500).render('error', { error: "Internal Server Error" });

//         const moviesData = JSON.parse(data);
//         res.render('pages/allData', { movies: moviesData });
//     });
// });

//step 9
app.get('/allData', (req, res) => {
    fs.readFile(path.join(__dirname, 'movieData', 'movieData.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).render('error', { error: "Internal Server Error" });

        const moviesData = JSON.parse(data);
        res.render('pages/allData', { movies: moviesData });
    });
});


// Step 8: Route for filtered movie data
app.get('/allData/filtered', (req, res) => {
    fs.readFile(path.join(__dirname, 'movieData', 'movieData.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).render('error', { error: "Internal Server Error" });

        const moviesData = JSON.parse(data);
        // Filter out movies with blank or N/A metascore
        const filteredMovies = moviesData.filter(movie => movie.Metascore && movie.Metascore !== "N/A");
        res.render('pages/allDataFiltered', { movies: filteredMovies });
    });
});

// Error handling for undefined routes
app.get('*', function(req, res) {
    res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
