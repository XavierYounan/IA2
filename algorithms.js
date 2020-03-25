//#region Algorithm to update articles
//Schedule update articles to run once every midnight
var j = schedule.scheduleJob('0 1 * * *', function(fireDate){ // run every midnight
    updateArticles() //run this function
    console.log('Updatea articles was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
});

async function updateArticles(){
    // Write all the articles
    await writeArticlesToDb(database)
    console.log("wrote all articles")
    
    //Process to remove all old enteries
    //Get the day of yesterday 0-7 based on monday to sunday
    var yesterday = new Date() //Create a new date object with the current date
    yesterday.setDate(yesterday.getDate() - 1);  //Set the day to today minus one 
    /*
        Day is monday to sunday 0-7
        if 7 will become 6
        if 0 will become 7
    */
    var oldDate = yesterday.getDay() //Get the day from that object

    //Remove old entries
    //Remote multiple entries where the day is the old date
    database.remove({day: oldDate}, {multi: true}, function (err, numRemoved) {
        if(err) console.error(err); //log any errors
        console.log('updateArticles finished') //Log completion of function once all articles have been removed
    });

}
async function writeArticlesToDb(db){

    const promises = []; //create a new array of promises
    
    //This function is shown later in the code display
    var toSearch = subjectsToSearchTerms(supportedSubjects) //Convert the supported subjects into search terms
    
    const noSubjects = toSearch.length //Get number of search terms

    //Could use for if desired
    //Loops through each search term
    var i = 0
    while(i<noSubjects){
        let subject = toSearch[i] //get current subject
        //Add a promise to the array that will resolve once articles are inserted into the database
        //Also call the function that will insert new articles into the database
        promises.push(getArticles(subject,db)); 
        await wait(10000); //Wait ten secconds
        i++ //loop onto next subject
    }
    await Promise.all(promises) //Function will return true once all promises are resolved
    return 
}


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
    
    const res = await fetch(query) //Query the NTY API

    //process the response into a json object 
    let data = await res.json();  

    if (data.status == 'OK'){
        //process the response
        let docs = data.response.docs; //Docs is an array that holds all the articles

        //Loop throguh all articles
        for (var i=0; i<numResults; i++) 
        {   
            var article = docs[i] //Get current article

            //Extract relevant information from the article          
            let headline = article.headline.main;
            let abstract = article.abstract;
            //get reference is detialed in another section of generate
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
                subject: subject, //To serve articles based on their subjects
                articleNumber: i, //Depreciated
                day: new Date().getDay() //For deletion of old entries
            }       
            db.insert(data) //insert the data into the database
        }    
        //console.log("Article fuffiled and promise set to true")
        return true;
    } else {
        //Log an error if present
        console.log("ERROR ------------------");
        console.log("NYT api reutrned with a non 200 result");
        console.log('Data is:');
        console.log(data);
        return false;
    };
};
//#endregion 

//#region Algorithm to get multimedia references
function getReference(multimedia){
    var mmediaLength = multimedia.length // Find the number of references to the image
    if(mmediaLength == 0){ //if there are no references retrun the strong no image
        return "noImage"
    }
    
    for (var i=0; i<mmediaLength ; i++){ //Loop throguh each entry
        //main image type
        if(multimedia[i].subtype == "superJumbo"){ // Loop through and check if multimedia is super jumbo
            var endUrl = multimedia[i].url  
            
            if(endUrl) {
              
                return  "https://static01.nyt.com/" + endUrl // Exit the loop and return the url
            }
        }

        //backup if doesnt exist
        if(multimedia[i].subtype == "xlarge"){ // Loop through and check if multimedia is xlarge
            var endUrl = multimedia[i].url 

            if(endUrl){
               
                return  "https://static01.nyt.com/" + endUrl
            }
        }

        //Seccond backup if other two arent present
        if(multimedia[i].subtype == "jumbo"){ // Loop through and check if multimedia is jumbo
            var endUrl = multimedia[i].url  
            if(endUrl){
                return  "https://static01.nyt.com/" + endUrl   
            }
        }
    }   
    return getAnyImage(multimedia) //if none of the 3 priority sizes return a link, use any avaliable
};

function getAnyImage(multimedia){

    var mmediaLength = multimedia.length // Find the number of references to the image
    for (var i=0; i<mmediaLength ; i++){ //Loop through each reference
        var endUrl = multimedia[i].url //get the first url
        if(endUrl){   
            return  "https://static01.nyt.com/" + endUrl //return that url
        }
    }
}
//#endregion

//#region 
//Set the array of supported subjects
const supportedSubjects = [
    "General Mathematics",
    "Mathematical Methods",
    "Essential Mathematics",
    "English",
    "Literature",
    "Essential English",
    "English and Literature Extension",
    //CONTINUED ...
]
//Set the object associating support subjects with search terms
searchTerms = { 
    "General Mathematics" : "Math",
    "Mathematical Methods" : "Math",
    "Essential Mathematics": "Math",
    "Essential English" : "English",
    //CONTINUED ...
}

function subjectsToSearchTerms(chosenSubjects){
    /*
    JSON object where the key is the subject and the value is the search term
    If there is no search term, then the subject name will be used

    Eg General math will be searched as math
    Physics will be searched as physics
    */
    //convert subjects into an array to search
    var toSearch = [] //define empty array

    let noSub = chosenSubjects.length //get length to loop through each subject
    for(var i=0; i<noSub; i++){ //for each subject

        let currentSubject = chosenSubjects[i] //get the current subject
        var term = searchTerms[currentSubject] //Check if object holds a search term

        if (term == undefined){ //If undefined then subject name will be used
            term = currentSubject
        }

        toSearch.push(term) //add search term to the response array
    }

    //get rid of duplicates
    var uniqueSet = new Set(toSearch) //convert array to set, only supports unique
    var toServe = [...uniqueSet] //convert set back to array
    return toServe //return unique array
};
//#endregion

//#region Redirect users
app.get("/", (req,res) => {
    var currentUser = req.user //get the currently logged in user
    /*
        the request object doesnt usually carry a user atribute
        This is where passport middleware intercepts the request and appends the user artibute based on the
        local strategy defined above
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
//#endregion

//#region Send articles
app.post("/getArticles", async (req,res) =>{
    //Get array of subjects for currently logged in user
    //This uses passport middleware
    var subjects = req.user.subjects

    var toServe = subjectsToSearchTerms(subjects)
    buildResponse(toServe).then(response => {
        res.json(response)
   });
});

async function buildResponse(toServe){ //Build the response based on the supplied subjects (toServe)
    //Creates a promise so wont send untill data is loaded
    let promise = new Promise( (resolve, reject) => { 
        var articles = {}; //Create an empty object that will store the articles

        //Loop through each subject
        const numSubjects = toServe.length
        for(var i=0; i<numSubjects; i++){
            var subject = toServe[i] //Get the current subject

            //Search the database for that subject and add it to the response object
             articles[subject] = searchDB(subject); 
        }
        //make a new promises that makes sure all promises in an object are resolved
        //Promise all properties is a npm module
        const promise = promiseAllProperties(articles)
        
        //Once this is resolved, resolve the major promise
        promise.then((resolvedObject) => {
            resolve(resolvedObject) //returnes the articles
        });
    });
}

async function searchDB(term){  
    //Search the database in an asyncronous fashion that is applicable to promise all properties
    let promise = new Promise( (resolve,reject) =>{
        //Search the database where the subject is the term supplied
        database.find({subject: term}, (err,data) => { 
            if(err){ //If error log and reject
                console.error(err);
                reject(err)
            }         
            if(data.length == 0){ //If empty log and reject
                reject("database find returned nothig. Data : " + data);
            }
            resolve(data) //is sucess resolve with data
        });
    });
    return promise
}
//#endregion

//#region Combine articles
function fCombineArticles(data){
    var subjects = Object.keys(data) // Get all the subjects server has returned
    var noSub = subjects.length //Get number of subjects
    var allArticles = [] //Create an empty array that will be populated with all the articles
    for(var i=0; i<noSub; i++){ //Loop through each subject
        var articles = data[subjects[i]] //Get the articles for that subject
        var noArticles = articles.length //Get the number of articles
        for(var j=0; j<noArticles; j++){ //Loop through each article
            var article = articles[j] //Get current article
            var noAllArticles = allArticles.length //Get Combined article length (again)
            var included = false //Assume not included
            for(var k=0; k<noAllArticles; k++){ //Loop through every combined article
                if(article.headline == allArticles[k].headline){ //if the headlines match (articles match)
                     //Add the current subject the the array of subjects that return this article
                    allArticles[k].subjects.push(subjects[i])
                    included = true //Article has already been included
                }
            }
            if(included == false){ //If artice was not already included
                article.subjects = [subjects[i]] //Add subject to subject array
                allArticles.push(article) //Ad article to all article array
            }
        }     
    }
    return allArticles //Return the build array
}
//#endregion

//#region Process button clicks
function loadArticles(obj){
    var subject = obj.innerText
    if(subject == "All Articles"){
        displayArticles(combinedArticles, true, "All Articles")
    }
    else{
        displayArticles(data[subject], false, subject)
    }
}

function displayArticles(articleArray, isAll, sub){
    $('#contentContainer').empty();//empty the current articles  

    let p = document.getElementById('currentArticles'); //Get the navbar text
    p.innerText = "Currently displaying results for " + sub + "." //Update it to show the sub (sujbect)

    let articleArrayLength = articleArray.length //get number of articles
    for(var i=0; i<articleArrayLength; i++){ //Loop through each article
        var article = articleArray[i] //Ger current article
        //Create a div for the aricle
        let div = document.createElement('div')
        div.className = "post" //Class is based off saturn theme

        //Add first horisontal rule
        let hr = document.createElement("hr")
        hr.className = "large" //Own custom hr
        div.appendChild(hr)

        //Add headline
        let headline = document.createElement("h1")
        headline.innerHTML = article.headline
        div.appendChild(headline)

        //Add seccond horisiontal rule
        let hr2 = document.createElement("hr")
        div.appendChild(hr2)
        //Add div for the content (saturn format)
        var div2 = document.createElement('div')
        div2.className = 'in-content'

        //Add image
        var imageRef = article.imageReference
        if(imageRef == "noImage"){ }else{ //If image exists
            let img = document.createElement('img');
            img.className = "right"
            img.src =  imageRef //Set source to url
            div2.appendChild(img)
        }
        //Add the abstract
        let abstract = document.createElement('p')
        abstract.innerHTML = article.abstract
        div2.appendChild(abstract)
        div2.appendChild(document.createElement('br')) //add a break
    
        //Add the first paragraph
        let firstPara = document.createElement("p")
        firstPara.innerHTML = article.firstPara
        div2.appendChild(firstPara)

        //Add the read more link
        let a = document.createElement('a')
        a.className = 'read-more'
        a.href = article.url
        a.target= "_blank"
        a.innerText = "Read More"
        div2.appendChild(a)
        div.appendChild(div2)

        //Add the footer div (saturn)
        let div3 = document.createElement('div')
        div3.className = "foot-post"

        //add this container (saturn)
        let div4 = document.createElement('div')
        div4.className = 'units-row'

        //Add the author
        let authorDiv = document.createElement('div')
        authorDiv.className = "unit-100"
        let author = document.createElement('strong')
        author.innerHTML = article.author //Aready has the "by" (no need to add)
        authorDiv.appendChild(author)
        div4.appendChild(authorDiv)

        //Add word count
        let wordCountDiv = document.createElement('div')
        wordCountDiv.className = "unit-100"

        let wordCountTitle = document.createElement('strong')
        wordCountTitle.innerHTML = "Word Count: "
        wordCountDiv.appendChild(wordCountTitle)

        let wordCount = document.createElement('a')
        wordCount.innerHTML = article.wordCount
        wordCountDiv.appendChild(wordCount)

        div4.appendChild(wordCountDiv)

        //Add publication date
        let dateObj = new Date(article.publicationDate);
        
        let dayNo = dateObj.getDay();
        let dayText = weekday[dayNo];
        let date = dateObj.getDate();
        let monthNo = dateObj.getMonth();
        let monthText = months[monthNo];

        let dayDiv = document.createElement('div');
        dayDiv.className = "unit-100";

        let dayTitle = document.createElement('strong');
        dayTitle.innerHTML = "Publication Date : ";
        dayDiv.appendChild(dayTitle);

        let day = document.createElement('a');
        day.innerHTML = dayText + " " + date + " " + monthText;
        dayDiv.appendChild(day);

        div4.appendChild(dayDiv);

        //Add interested subjects if all subjects are selected
        if(isAll){
            let subBasedOff = article.subjects
            var str = ""

            numSubBased = subBasedOff.length
            for(var j=0; j<numSubBased; j++){
                if(j == numSubBased -1){
                    str = str.slice(0,-2) //remove old comma
                    str = str + " and " + subBasedOff[j] //add subject and and
                }else{
        
                    str = str + subBasedOff[j] + ", "
                }
            }
            
            
            let basedOffDiv = document.createElement('div')
            basedOffDiv.className = "unit-100"

            let basedOffTitle = document.createElement('strong')
            basedOffTitle.innerHTML = "Becasue of your interest in: " 
            basedOffDiv.appendChild(basedOffTitle)

            let basedOff = document.createElement('a')
            basedOff.innerHTML = str
            basedOffDiv.appendChild(basedOff)

            div4.appendChild(basedOffDiv)
        }

        //add all divs
        div3.appendChild(div4);
        div.appendChild(div3);

        //add full div to page
        var container = document.getElementById('contentContainer');
        container.appendChild(div);
    }
}
//#endregion