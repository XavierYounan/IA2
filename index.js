const express = require('express'); //import express framework
const fs = require('fs'); //import file system framework
const Datastore = require('nedb'); //import database framework
const fetch = require("node-fetch"); //import fetch function
const schedule = require('node-schedule')
//const initalizePassport = require('./passport-config')
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const cookieParser = require('cookie-parser')

//const sqlite3 = require('sqlite3')



//  PUT THE DATA IN THE GET REQUEST !!!!!

//Set constants

const supportedSubjects = [
"General Mathematics",
"Mathematical Methods",
"Essential Mathematics",
"English",
"Literature",
"Essential English",
"English and Literature Extension",
"Accounting",
"Business",
"Economics",
"Legal Studies",
"Fashion",
"Food and Nutrition",
"Visual Art",
"Health",
"Physical Education",
"Ancient History",
"Geography",
"Modern History",
"Philosophy and Reason",
"Chinese",
"French",
"Japanese",
"External examination languages", //could do request your language to be added or just do languages
"Specalists Mathematics",
"Drama",
"Music",
"Drama in Practice",
"Music in Pracitice",
"Music Extension (Composition)",
"Music Extension (Musicology)",
"Music Extension (Performance)",
"Biology",
"Chemistry",
"Physics",
"Psychology",
"Design",
"Digital Solutions",
"Engineering",
"Industrial Technology Skills",
"Certificate III in Buisness",
"Certificate III in Hospitality",
"Certificate III in Sport and Recreation",
"Certificate III in Visual Arts",
"Diploma of Buisness"
]

searchTerms = {
"General Mathematics" : "Math",
"Mathematical Methods" : "Math",
"Essential Mathematics": "Math",
"Essential English" : "English",
"English and Literature Extension": "Literature",
"Legal Studies": "Law",
"Visual Art": "Art",
"Physical Education": "Sport",
"External examination languages": "Language",
"Specalists Mathematics": "Math",
"Drama in Practice": "Drama",
"Music in Pracitice": "Music",
"Music Extension (Composition)": "Music Composition",
"Music Extension (Musicology)": "Musicology",
"Music Extension (Performance)": "Music Performance",
"Industrial Technology Skills": "DIY",
"Certificate III in Buisness": "Buisness",
"Certificate III in Hospitality": "Hospitality",
"Certificate III in Sport and Recreation": "Sport",
"Certificate III in Visual Arts": "Art",
"Diploma of Buisness": "Buisness"
}

const numResults = 10; // Set desired number of results

//Database
const database = new Datastore("public/data/database")
database.loadDatabase()

const usersDatabase = new Datastore("public/data/userDatabase")
usersDatabase.loadDatabase()

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, done) {
    //console.log("searliseUser, user: " + JSON.stringify(user))

    done(null, user._id);
  });
  
passport.deserializeUser(function(id, done) {
    //console.log("deserializeUser, id " + id)
    usersDatabase.findOne({_id:id}, function(err,user){
        if(err){ return done(err);}
       // console.log("desearlised user, user: " + JSON.stringify(user))
        done(null,user)
    });
});







//Server
const app = express(); //Initialise the express object

//start the server listening on port 3000, notify the console
app.listen(3000, () => console.log('listening on port 3000')); 

//Set the static directory to the folder public
app.use(express.static('public',{index: false})); //lets custom code deal with "/" dir

app.use(require('express-session')({ secret: 'xyrexy', resave: false, saveUninitialized: false }))
app.use(cookieParser())

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());



app.use(express.json({limit: '1mb'}));

//Schedule job
var j = schedule.scheduleJob('0 1 * * *', function(fireDate){
    updateArticles(fireDate)
    console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
});


passport.use(new LocalStrategy({
    usernameField: "email",
},

function(username, password, done) {
  usersDatabase.findOne({ email: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
        console.log("Incorrect email")
      return done(null, false, { message: 'Incorrect email.' });
    
    }
    if (password != user.password) {
        console.log("wrong pass")
        return done(null, false, { message: 'Incorrect password.' });
    }
    console.log("good")
    return done(null, user);
  });
}
));


app.get("/", (req,res) => {
    var currentUser = req.user
    //console.log("curren user is: " + JSON.stringify(currentUser))
    if(currentUser == undefined) {
        //console.log("Page / redirected, user: " + currentUser)
        res.redirect("/login")
    }else {
        //console.log("Page / not redirected, user: " + currentUser)
        res.sendFile(__dirname + "/public/index.html");
    }    
});



app.get("/login", (req,res) => {

    var currentUser = req.user

    if(currentUser == undefined) {
      //  console.log("page /login not redirected, user: " + currentUser)
        res.sendFile(__dirname + "/public/login.html");   
    }else {
       // console.log("page /login redirected, user: " + currentUser)
        res.redirect("/")
        
    }    
});

app.post('/login', function(req, res, next) {
    
    passport.authenticate('local', function(err, user, info) {

        if (err) { 
            let data = {
                success: false,
                message: "Error when authenticating, please refresh the page and try again"
            }

            res.json(data)
            console.log("Error when authenticating, please refresh the page and try again")
            return next(err); 
  
        } 

        if (!user) { //auth failed, send JSON data about error
            let data = {
                success: false,
                message: info.message
            }
            res.json(data)
            return //so log in doesnt run
        } 

        console.log("login user is : " + JSON.stringify(user))
        req.logIn(user, function(err) { //log in the as no longer done automatically by middleware
            if (err) { 
            
                let data = {
                    success: false,
                    message: "Error when logging in, please refresh the page and try again"
                }

                res.json(data)
                return next(err); 
            } 

            let data = {
                success: true,
                message: user.name
            }

            res.json(data)

            return 
        });

    })(req, res, next);
    
});



app.get("/register", (req,res) => {

    var currentUser = req.user
    
    if(currentUser == undefined) {
        //console.log("page /register not redirected, user: " + currentUser)
        res.sendFile(__dirname+ "/public/register.html")

    }else {
        //console.log("page /register redirected, user: " + currentUser)
        res.redirect('/')
    }   

    
});


app.post("/register", (req,res) => {
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        subjects: req.body.subjects
    }

    usersDatabase.insert(newUser, (err,user) => { //user has an _id atribuite where newUser doesnt
        if(err){
            let data = {
                success: false,
                message: "Error when inserting into db"
            }
            res.json(data)
            return
            
        }
        req.logIn(user, function(err) { //log in the as no longer done automatically by middleware
            if (err) { 
                let data = {
                    success: false,
                    message: "Error when logging in"
                }
                res.json(data)
                return next(err); 
            } 

            let data = {
                success: true,
                message: user.name
            }   
            res.json(data)
            return
        }); 
    });       
});

app.post("/getArticles", (req,res) =>{

    //Get array of subjects for currently logged in user
    var subjects = req.user.subjects

    var toServe = subjectsToSearchTerms(subjects)

    //console.log(toServe) //Temp
    var query = {
        $or: [
        ]
    }

    const numSubjects = toServe.length

    for(var i=0; i<numSubjects; i++){
        query.$or.push({subject: toServe[i]})
    }

    database.find(query, (err,data) => {
        if(err){
            console.error(err)
            res.end()
        } else {
            if (data.length == 0)
            {
                console.log("database find returned nothing. Data :" + data)
                res.end()
            } else {
                response = {
                    articles: data
                }

                console.log(response)
                res.json(response)
            }
        }
    });
});


app.post("/getSubjects", (req,res) =>{ //sends the supported subjects 
    data = {
        subjects: supportedSubjects
    }

    res.json(data)
});


//Helper functions and utility 
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function getReference(multimedia){

    var mmediaLength = multimedia.length // Find the number of references to the image
    for (var i=0; i<mmediaLength ; i++){
        //should add support for multiple types
        if(multimedia[i].subtype == "superJumbo"){ // Loop through and check if multimedia is super jumbo
            let endUrl = multimedia[i].url  // Exit the loop and return the url
            
            return "https://static01.nyt.com/" + endUrl
        }
    }    
};


function toNYTdate(date){
    //converts the date into a NYT date
    /*
        Year - month - day
        Eg 2012-02-22 -> 20120222

        Ensures 2 digits on the month and day
    */
 
    //add year
    let NYTdate = (date.getYear() + 1900).toString();

    //add month
    var month = (date.getMonth() + 1).toString(); //calculate string value of months
    month = ("0" + month).slice(-2); //ensure month is a 2 digit number string
    NYTdate += month; //add month to the date

    // Add day, same process as month
    var day = (date.getDate()).toString();
    day = ("0" + day).slice(-2);
    NYTdate += day;

    return NYTdate
}

async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

//#region Update the articles
async function getArticles(subject,db){
    /*  
        Uses the supplied subject to build a query to the NYT api
        Querys the NYT api and ensures sucess
        Saves data in database and resets timer for daily update of articles
    */

    //Defined constants
    const apiKey = "hkh5XnKjmXLUvP8tJrcjh4SgPsJ1D0tj"; // Set auth key
    const sort = "relevance"

    // Create a base url ready to accept query and be fetched
    var queryBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=" + apiKey;

    //Get dates 
    var today = new Date(); //get the date right now
    var lastWeek = new Date() //create a new date object
    lastWeek.setDate(today.getDate() - 7); //get the date 1 week ago

    // Convert dates into a format accepted by the NYT API
    var today = toNYTdate(today)
    var lastWeek = toNYTdate(lastWeek)
    //console.log(today + " " + lastWeek) Temp

    //Find the search term related to the subject
    var searchTerm = searchTerms[subject] //retuns undefined if value doesnt exist
    if(searchTerm = "undefined") searchTerm = subject;

    // Create the query
    query = queryBase + "&q=" + searchTerms; //append the steralised subject to the query
    query = query + "&begin_date=" + lastWeek; //apped the steralised begin date to the query
    query = query + "&end_date=" + today; //append the steralised end date to the query
    query = query + "&sort=" + sort; //append the sort type to the query
    //console.log(query) //Temp
    
    const res = await fetch(query)

    //console.log(res) // Temp make sure working

    //process the response into a json object 
    let data = await res.json();  //Is this necessary
    //console.log(data); // Temp make sure working

    if (data.status == 'OK'){
        //process the response
        let docs = data.response.docs;
       
        //console.log(docs) //Temp

        for (var i=0; i<numResults; i++) //temp to find right multimedia
        {   
            var article = docs[i]
          
            let headline = article.headline.main;
            let abstract = article.abstract;
            let imageReference = getReference(article.multimedia);
            let author = article.byline.original;
            let publicationDate = article.pub_date;
            let firstPara = article.lead_paragraph;
            let url = article.web_url;
            let wordCount = article.word_count
            let source = article.source;

            // Construct the data into a Js object
            let data = { 
                //Information for displaying article
                headline: headline,
                abstract: abstract,
                imageReference: imageReference,
                author: author,
                publicationDate: publicationDate,
                firstPara: firstPara,
                url: url,
                wordCount: wordCount,
                source: source, 

                //Information for server
                subject: subject,
                articleNumber: i,
                day: new Date().getDay()
            }
            
            db.insert(data) //insert the data into the database
            console.log("inserted into the database, subject: " + subject)
            //console.log("Inserted into the database") // 
        }
        
        //console.log("Article fuffiled and promise set to true")
        return true;
    } else {
        //Log an error
        console.log("ERROR ------------------");
        console.log("NYT api reutrned with a non 200 result");
        console.log('Data is:');
        console.log(data);

        return false;
    };
};

async function writeArticlesToDb(db){

    const promises = [];

    var toSearch = subjectsToSearchTerms(supportedSubjects)
    
    const noSubjects = toSearch.length

    var i = 0

    while(i<noSubjects){
        let subject = toSearch[i]
        promises.push(getArticles(subject,db));
        await wait(10000);
        i++
    }
    await Promise.all(promises) //wait for all calls to finsih
    return 
}

async function updateArticles(fireDate){
    
    console.log('updateArticles was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());

    // Write all the articles
    await writeArticlesToDb(database)
    console.log("wrote all articles")
    
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1);  
    var oldDate = yesterday.getDay()


    database.remove({day: oldDate}, {multi: true}, function (err, numRemoved) {
        if(err) console.error(err);
        console.log('updateArticles finished')
    });


    

}
//#endregion

function subjectsToSearchTerms(chosenSubjects){
    //convert subjects into an array to search
    var toSearch = [] //define empty array

    let noSub = chosenSubjects.length //get length to loop through each subject
    for(var i=0; i<noSub; i++){

        let currentSubject = chosenSubjects[i]
        var term = searchTerms[currentSubject]

        if (term == undefined){
            term = currentSubject
        }

        toSearch.push(term)
    }

    //get rid of duplicates
    var uniqueSet = new Set(toSearch) //convert array to set, only supports unique
    var toServe = [...uniqueSet] //convert set back to array
    return toServe
};


//updateArticles(Date()) //Temp 
