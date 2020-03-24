
const express = require('express'); //import express framework
const fs = require('fs'); //import file system framework
const Datastore = require('nedb'); //import database framework
const fetch = require("node-fetch"); //import fetch function
const schedule = require('node-schedule') //import the schedular framework


//Set up passport and cookie parser for logins
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser')

/*
    Promise.All of a JSON object
    see https://www.npmjs.com/package/promise-all-properties
    by marcelowa
*/
async function promiseAllProperties(promisesMap) {
    if (promisesMap === null || typeof promisesMap !== 'object') {
        return Promise.reject(new TypeError('The input argument must be of type Object'));
    }
    const keys = Object.keys(promisesMap);
    const promises = keys.map((key) => {
        return promisesMap[key];
    });
    const results = await Promise.all(promises);
    return results.reduce((resolved, result, index) => {
        resolved[keys[index]] = result;
        return resolved;
    }, {});
}


//Set the array of supported subjects
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

/*
  JSON object where the key is the subject and the value is the search term
  If there is no search term, then the subject name will be used

  Eg General math will be searched as math
  Physics will be searched as physics
*/
searchTerms = { //When evaluate say an array of search terms would have been better
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

const numResults = 10; // Set desired number of results for articles of each subject 

//Create and load the article database
const database = new Datastore("public/data/database")
database.loadDatabase()

//Create and load the user database
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

//#region setup server
//Server
const app = express(); //Initialise the express object

//start the server listening on port 3000, notify the console
app.listen(3000, () => console.log('listening on port 3000')); 

//Set the static directory to the folder public
app.use(express.static('public',{index: false})); //lets custom code deal with Get "/" dir

//Enable sessions, cookie parser is used for sessions
app.use(require('express-session')({ secret: 'thefatbrowncatjumpsoverthelazylog', resave: false, saveUninitialized: false }))
app.use(cookieParser())

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

//Set the size limit of json files to 1mb to prevent spam
app.use(express.json({limit: '1mb'}));
////#endregion

//Schedule update articles to run once every midnight
var j = schedule.scheduleJob('0 1 * * *', function(fireDate){ // run every midnight
    updateArticles(fireDate)
    console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
});

//Setup the passport local strategy to get user info from the database
passport.use(new LocalStrategy({usernameField: "email"}, //Change the default usernameField from username to email

    //done is structured as (error, user, login info (JSON))
    function(username, password, done) { //function that finds user information based on username or password
    usersDatabase.findOne({ email: username }, function(err, user) { //Find the associated user from the database 
        //Should only be one user but use usersDatabase.findOne just incase.
        //Potentially check if are returned using find and then log an error if so
        if (err) { return done(err); } //return error
        if (!user) { //if no user than the email must be incorrect
            console.log("Incorrect email") //Doesnt have to be ambiguous because this is server side
            return done(null, false, { message: 'Incorrect email or password.' }); //ambiguopus as sent to client
        }
        //if a user has been returned
        if (password != user.password) { //check passwords match
            console.log("Incorrect password") //Doesnt have to be ambiguous because this is server side
            return done(null, false, { message: 'Incorrect email or password.' }); //ambiguopus as sent to client
        }
        return done(null, user); //sucess, return the user information
    });
    }
));

//Load the home page
app.get("/", (req,res) => {
    var currentUser = req.user //get the currently logged in user
    /*
        the request object doesnt usually carry a user atribute
        This is where passport middleware intercepts the request and appends the user artibute based on the local strategy defined above
        Cookies are used to determine user persistance
    */

    //console.log("curren user is: " + JSON.stringify(currentUser))
    if(currentUser == undefined) { //if the user isnt logged in redirect so they can login
        //console.log("Page / redirected, user: " + currentUser)
        res.redirect("/login")
    }else {
        //console.log("Page / not redirected, user: " + currentUser)
        res.sendFile(__dirname + "/public/index.html"); //user is logged in, send page. potentially also send username
    }    
});


//load the login page
app.get("/login", (req,res) => {
    /*
    similar to the process above except if the user is already logged in will redirect to the articles page
    comments are not necessary here, please see above
    */

    var currentUser = req.user

    if(currentUser == undefined) {
      //  console.log("page /login not redirected, user: " + currentUser)
        res.sendFile(__dirname + "/public/login.html");   
    }else {
       // console.log("page /login redirected, user: " + currentUser)
        res.redirect("/")
        
    }    
});

//User has entered in information and clicked submit on the form
app.post('/login', function(req, res, next) {
    
    passport.authenticate('local', function(err, user, info) { //see local strategy for what the function returns (err, user, info)

        //Unknown error
        if (err) { 
            let data = {
                success: false,
                message: "Error when authenticating, please refresh the page and try again"
            }

            res.json(data) //sends the json data to the client
            console.log("Error when authenticating, please refresh the page and try again")
            return next(err); //breaks out of the login process
        } 

        if (!user) { //email or password is wrong
            let data = {
                success: false,
                message: info.message //should alwasy say Error Username or Password is incorrect
            }
            res.json(data) // Sends the json data to the client
            return //breaks out of the login process
        } 

        //console.log("login user is : " + JSON.stringify(user))
        
        req.logIn(user, function(err) { //log in the as no longer done automatically by middleware
            //error process is same as above
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


//send the register page
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
    //Create a new user object from the request
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        subjects: req.body.subjects
    }

    /*  
        Insert the new user into the database
        leave the field _id empty for user so that nedb will create one
        Function returns user which is same as newUser but with the atribute _id
    */
    usersDatabase.insert(newUser, (err,user) => { 
        if(err){ //if there is an error adding the new user notifiy the user and say couldnt log in
            let data = {
                success: false,
                message: "Error when inserting into db"
            }
            res.json(data)
            return        
        }

        req.logIn(user, function(err) { //log in the as no longer done automatically by middleware, same as login process
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

async function buildResponse(toServe){ //Build the response based on the supplied subjects (toServe)

    let promise = new Promise( (resolve, reject) => {
        var promises = [];
        var articles = {};

        const numSubjects = toServe.length

        for(var i=0; i<numSubjects; i++){

            var subject = toServe[i]

             articles[subject] = searchDB(subject);
  
        }

        const promise = promiseAllProperties(articles)
 
        promise.then((resolvedObject) => {
            resolve(resolvedObject)
        });
    });
    
    return promise
}

async function searchDB(term){  
    let promise = new Promise( (resolve,reject) =>{
        database.find({subject: term}, (err,data) => {
            if(err){
                console.error(err);
                reject(err)
            }
                
            if(data.length == 0){
                console.log("database find returned nothing. Data :" + data);
                reject("database find returned nothig. Data : " + data);
            }

            console.log("data is " + data)

            resolve(data)
        });
    });
    return promise
}



app.post("/getArticles", async (req,res) =>{

    //Get array of subjects for currently logged in user
    var subjects = req.user.subjects

    var toServe = subjectsToSearchTerms(subjects)

    /*
    //console.log(toServe) //Temp
    var query = {
        $or: [
        ]
    }
    */

   buildResponse(toServe).then(response => {
        res.json(response)
   });



    /*

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
                var articles = data
                var response = []

                //Loop through articles
                var numArticles = articles.length

                for(var i=0; i<numArticles; i++){
                    //get article
                    var article = articles[i]
                    var headline = article.headline

                    //if article doesnt already exist in response
                    if(!(response.includes(headline))){
                        //add it to response
                        response.push(article)
                    }  
                }

                //make the rsponses a json object not an array
                let toSend = {
                    articles: response
                }

                res.json(toSend)
            }
        }
    });
    */
});


app.post("/getSubjects", (req,res) =>{ //sends the supported subjects 
    data = {
        subjects: supportedSubjects
    }

    res.json(data)
});



function shuffle(a) {
    //Helper functions and utility 
    /**
     * Shuffles array in place.
     * @param {Array} a items An array containing the items.
     */

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
    if(mmediaLength == 0){
        return "noImage"
    }
    
    for (var i=0; i<mmediaLength ; i++){

        //main
        if(multimedia[i].subtype == "superJumbo"){ // Loop through and check if multimedia is super jumbo
            var endUrl = multimedia[i].url  // Exit the loop and return the url
            
            if(endUrl) {
                console.log("first")
                return  "https://static01.nyt.com/" + endUrl
            }
        }

        //backup
        if(multimedia[i].subtype == "xlarge"){ // Loop through and check if multimedia is xlarge
            var endUrl = multimedia[i].url  // Exit the loop and return the url

            if(endUrl){
                console.log("seccond")
                return  "https://static01.nyt.com/" + endUrl
            }
        }

        if(multimedia[i].subtype == "jumbo"){ // Loop through and check if multimedia is jumbo
            var endUrl = multimedia[i].url  // Exit the loop and return the url
            if(endUrl){

                return getAnyImage(multimedia)
            }else{
                console.log("thrid")
                return  "https://static01.nyt.com/" + endUrl
            }
            
        } 
    }    
};

function getAnyImage(multimedia){

    var mmediaLength = multimedia.length // Find the number of references to the image
    for (var i=0; i<mmediaLength ; i++){
        var endUrl = multimedia[i].url
        console.log("any, try: " + i)
        if(endUrl){   
            return  "https://static01.nyt.com/" + endUrl
        }
    }
}

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

        https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=apiKaey&q=searchterm&
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
    query = queryBase + "&q=" + searchTerm; //append the steralised subject to the query
    query = query + "&begin_date=" + lastWeek; //apped the steralised begin date to the query
    query = query + "&end_date=" + today; //append the steralised end date to the query
    query = query + "&sort=" + sort; //append the sort type to the query
    console.log(query) //Temp
    
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
            //console.log("inserted into the database, subject: " + subject)
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
    for(var i=0; i<noSub; i++){ //for each subject

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
