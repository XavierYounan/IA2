// register service worker
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js', { scope: '/Public/' }).then(function(reg) {
  
            if(reg.installing) {
              console.log('Service worker installing');
            } else if(reg.waiting) {
              console.log('Service worker installed');
            } else if(reg.active) {
              console.log('Service worker active');
              
            }
      
            console.log('ServiceWorker registration successful with scope: ', reg.scope);
        
          }).catch(function(error) {
            // registration failed
            console.log('Service worker registration failed: ' + error);
          });
    });
    
};
*/

// Get saved data from sessionStorage
/*
var name = sessionStorage.getItem('name'); //currently is undefined, session store might not be working correcty
console.log(name)
*/
const weekday=new Array(7);
weekday[0]="Monday";
weekday[1]="Tuesday";
weekday[2]="Wednesday";
weekday[3]="Thursday";
weekday[4]="Friday";
weekday[5]="Saturday";
weekday[6]="Sunday";

const months = [
    "January",
    "Febuary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]



loadProcess()


async function loadProcess(){
    const data = await requestArticles()
    
    const combinedArticles = fCombineArticles(data)
  
    //make global variables
    window.data = data
    window.combinedArticles = combinedArticles

    createButtons(Object.keys(data))

    displayArticles(combinedArticles, true, "All Articles")

}

function createButtons(subjects){
    var size = subjects.length
    
    for(var i=0; i<size; i++){
        /* create this
        <button type="button" class="btn btn-default btn-block btn-group-vertical", onclick="loadArticles(this)">maths</button>
        */
       var button = document.createElement("button")

       button.type = "button"
       button.className = "btn btn-default btn-block "
       button.onclick = function(){loadArticles(this)};
       button.innerText = subjects[i]

        //add button to div
        var buttonDiv = document.getElementById('buttons');
        buttonDiv.appendChild(button);
    }
}

function fCombineArticles(data){
    var subjects = Object.keys(data)
    //console.log(subjects)

    var noSub = subjects.length
    //console.log(noSub)

    var allArticles = []

    for(var i=0; i<noSub; i++){
        //console.log(i)
        var articles = data[subjects[i]]
        //console.log(articles)

        var noArticles = articles.length
        //console.log(noArticles)

        for(var j=0; j<noArticles; j++){
            var article = articles[j]

            var noAllArticles = allArticles.length

            var included = false
            for(var k=0; k<noAllArticles; k++){
                if(article.headline == allArticles[k].headline){
                    allArticles[k].subjects.push(subjects[i])
                    included = true
                }
            }

            if(included == false){
                article.subjects = [subjects[i]]
                allArticles.push(article)
            }
            

            //console.log(article)
        }
        
    }
    //console.log(allArticles)
    return allArticles
}

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
    //empty the current articles
    $('#contentContainer').empty();


    //add full div to page
    let p = document.getElementById('currentArticles');
    p.innerText = "Currently displaying results for " + sub + "."

    let articleArrayLength = articleArray.length
    for(var i=0; i<articleArrayLength; i++){
        var article = articleArray[i]
        
        //console.log(article) //Temp
    
        //#region definitions

        /* Article is as follows
        
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
        */


        /* Template formatting
        <div class=col-8>
            <!-- Post -->

                <div class="post">
                    <!-- Heading -->
                    <a href="#"><h1>Galaxy is on your hand</h1></a>
                    <hr>

                    <div class="in-content">
                        <p>
                            Saturn has a prominent ring system that consists of nine continuous main rings and three discontinuous arcs, composed mostly of ice particles with a smaller amount of rocky debris and dust. Sixty-two known moons orbit the planet, of which fifty-three are officially named. This does not include the hundreds of "moonlets" comprising the rings.
                        </p>
                        <a class="read-more" href="#">Read more</a>
                    </div>

                    
                </div>

            <!-- /post -->

            <!-- next post -->

            <!-- repeat -->
        </div>
        */
       //#endregion

        
        let div = document.createElement('div')
        div.className = "post"

        let hr = document.createElement("hr")
        hr.className = "large"
        div.appendChild(hr)

        let headline = document.createElement("h1")
        headline.innerHTML = article.headline
        div.appendChild(headline)

        let hr2 = document.createElement("hr")
        div.appendChild(hr2)

        var div2 = document.createElement('div')
        div2.className = 'in-content'

        var imageRef = article.imageReference
        
        if(imageRef == "noImage")
        {
          
        }else{
            let img = document.createElement('img');
            img.className = "right"
            img.src =  imageRef
            div2.appendChild(img)

        }

        let abstract = document.createElement('p')
        abstract.innerHTML = article.abstract
        div2.appendChild(abstract)

        div2.appendChild(document.createElement('br'))
    
        let firstPara = document.createElement("p")
        firstPara.innerHTML = article.firstPara
        div2.appendChild(firstPara)

        let a = document.createElement('a')
        a.className = 'read-more'
        a.href = article.url
        a.target= "_blank"
        a.innerText = "Read More"
        div2.appendChild(a)

        div.appendChild(div2)

        let div3 = document.createElement('div')
        div3.className = "foot-post"

        let div4 = document.createElement('div')
        div4.className = 'units-row'

        let authorDiv = document.createElement('div')
        authorDiv.className = "unit-100"

        let author = document.createElement('strong')
        author.innerHTML = article.author
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


        //Add interested subjects
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

async function requestArticles(){
    
    /* Temp using array so can use live server
    const response = await fetch('/getArticles', {method: 'post'});
    const json = await response.json();

    return json
    console.log(JSON.stringify(json))
    */ 
    //var subjects = json.keys()

    
    
    let fakeArray = {"Sport":[{"headline":"Myanmar Army Sues Reuters for Criminal Defamation: Police","abstract":"Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-09T15:54:09+0000","firstPara":"(Reuters) - Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","url":"https://www.nytimes.com/reuters/2020/03/09/world/asia/09reuters-myanmar-reuters.html","wordCount":622,"source":"Reuters","subject":"Sport","articleNumber":9,"day":2,"_id":"9s9jmsN5ozPi9ONk"},{"headline":"‘Swallow’ Review: Objects in Stomach May Be Sharper Than They Appear","abstract":"Haley Bennett plays a woman whose dangerous new habit is presented as a way to gain control over her life.","imageReference":"https://static01.nyt.com/images/2020/03/04/arts/04swallowpix/merlin_169651200_a30cb9a8-1eb2-4848-853b-b0f3f92d4136-articleLarge.jpg","author":"By Kristen Yoonsoo Kim","publicationDate":"2020-03-05T12:00:07+0000","firstPara":"It’s easy to mistake Hunter Conrad (Haley Bennett), the woman at the center of “Swallow,” for a mid-20th-century housewife: She dotes on her husband while wearing pearls and cocktail dresses and has a Jackie Kennedy bounce to her bob. The one deviation is playing iPhone games to relieve her ennui.","url":"https://www.nytimes.com/2020/03/05/movies/swallow-review.html","wordCount":259,"source":"The New York Times","subject":"Sport","articleNumber":0,"day":2,"_id":"D7BuTClrrd2cNoWX"},{"headline":"A Striking Balance of New and Rediscovered at the Independent Fair","abstract":"In this year’s whimsical edition, the 11-year-old art fair looks back to lesser-known work from the 1960s.","imageReference":"https://static01.nyt.com/images/2020/03/05/arts/05independent-combo/05independent-combo-articleLarge.jpg","author":"By Will Heinrich","publicationDate":"2020-03-05T21:54:40+0000","firstPara":"Looking out the windows of Spring Studios in upscale TriBeCa during this year’s 11th Independent Art Fair, I thought about the cycle of fashion. There are spectacular views of the teardrop-shaped roadway that leads out of the Holland Tunnel; on the same site, some two centuries ago, stood an exclusive gated park. Sooner or later, everything old is new again, and the most striking presentations in this fair, founded in 2010 by Elizabeth Dee to provide a curated alternative to larger art fairs, are revivals of work from the 1980s, the 1960s, or even earlier.","url":"https://www.nytimes.com/2020/03/05/arts/design/independent-art-fair-review.html","wordCount":1129,"source":"The New York Times","subject":"Sport","articleNumber":4,"day":2,"_id":"G2Kfi3aIskwk4FOY"},{"headline":"Dogs Can Detect Heat With 'Infrared Sensor' in Their Nose, Research Finds","abstract":"Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T16:56:55+0000","firstPara":"BUDAPEST — Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","url":"https://www.nytimes.com/reuters/2020/03/03/world/europe/03reuters-hungary-science-dogs.html","wordCount":269,"source":"Reuters","subject":"Sport","articleNumber":2,"day":2,"_id":"GK1oNBK5G46eue7h"},{"headline":"U.S. State Department Approves Possible $2.4 Billion Sale of 8 KC-46 Jets to Israel: Pentagon","abstract":"The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-04T04:59:21+0000","firstPara":"WASHINGTON — The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","url":"https://www.nytimes.com/reuters/2020/03/03/world/middleeast/03reuters-usa-israel-kc-46.html","wordCount":92,"source":"Reuters","subject":"Sport","articleNumber":3,"day":2,"_id":"YapmcnoVZT9yidEI"},{"headline":"Trump Campaign Sues Washington Post Over Opinion Pieces, After Suing NY Times","abstract":"U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T22:57:27+0000","firstPara":"NEW YORK — U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","url":"https://www.nytimes.com/reuters/2020/03/03/us/politics/03reuters-usa-election-trump-lawsuit.html","wordCount":489,"source":"Reuters","subject":"Sport","articleNumber":6,"day":2,"_id":"fo78Yg7rmlByr3Za"},{"headline":"German Police: At Least 7 Involved in Dresden Jewelry Theft","abstract":"At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-05T14:08:10+0000","firstPara":"BERLIN — At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","url":"https://www.nytimes.com/aponline/2020/03/05/world/europe/ap-eu-germany-stolen-treasures.html","wordCount":231,"source":"AP","subject":"Sport","articleNumber":8,"day":2,"_id":"iqot4SH8EdC2viO6"},{"headline":"Consent the Key in Spain's New Sex Crimes Draft Bill","abstract":"The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T13:56:15+0000","firstPara":"MADRID — The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","url":"https://www.nytimes.com/aponline/2020/03/03/world/europe/ap-eu-spain-sex-crimes-law.html","wordCount":222,"source":"AP","subject":"Sport","articleNumber":7,"day":2,"_id":"pn8yCWIxkdvVGc9X"},{"headline":"How to Stop Touching Your Face","abstract":"We know it’s hard. Try these four tricks to help limit the number of times you touch your face each day to help prevent the spread of the coronavirus.","imageReference":"noImage","author":"By Jenny Gross","publicationDate":"2020-03-05T12:03:00+0000","firstPara":"Now that we know that it’s bad to touch our faces, how do we break a habit that most of us didn’t know we had?","url":"https://www.nytimes.com/2020/03/05/health/stop-touching-your-face-coronavirus.html","wordCount":671,"source":"The New York Times","subject":"Sport","articleNumber":5,"day":2,"_id":"xNv2I1J2yjBYfiuE"},{"headline":"Reward for Info on Slain Dolphins Increases to $54,000","abstract":"A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T00:26:38+0000","firstPara":"ST. PETERSBURG, Fla. — A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","url":"https://www.nytimes.com/aponline/2020/03/02/us/ap-us-slain-dolphins.html","wordCount":210,"source":"AP","subject":"Sport","articleNumber":1,"day":2,"_id":"z6XN3TLuojemB7cZ"}],"Buisness":[{"headline":"German Police: At Least 7 Involved in Dresden Jewelry Theft","abstract":"At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-05T14:08:10+0000","firstPara":"BERLIN — At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","url":"https://www.nytimes.com/aponline/2020/03/05/world/europe/ap-eu-germany-stolen-treasures.html","wordCount":231,"source":"AP","subject":"Buisness","articleNumber":8,"day":2,"_id":"04iks9vrtGkifxfn"},{"headline":"Reward for Info on Slain Dolphins Increases to $54,000","abstract":"A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T00:26:38+0000","firstPara":"ST. PETERSBURG, Fla. — A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","url":"https://www.nytimes.com/aponline/2020/03/02/us/ap-us-slain-dolphins.html","wordCount":210,"source":"AP","subject":"Buisness","articleNumber":1,"day":2,"_id":"adShqJWzMYrzJP30"},{"headline":"Myanmar Army Sues Reuters for Criminal Defamation: Police","abstract":"Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-09T15:54:09+0000","firstPara":"(Reuters) - Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","url":"https://www.nytimes.com/reuters/2020/03/09/world/asia/09reuters-myanmar-reuters.html","wordCount":622,"source":"Reuters","subject":"Buisness","articleNumber":9,"day":2,"_id":"efamzv4G0GCNeOxy"},{"headline":"‘Swallow’ Review: Objects in Stomach May Be Sharper Than They Appear","abstract":"Haley Bennett plays a woman whose dangerous new habit is presented as a way to gain control over her life.","imageReference":"https://static01.nyt.com/images/2020/03/04/arts/04swallowpix/merlin_169651200_a30cb9a8-1eb2-4848-853b-b0f3f92d4136-articleLarge.jpg","author":"By Kristen Yoonsoo Kim","publicationDate":"2020-03-05T12:00:07+0000","firstPara":"It’s easy to mistake Hunter Conrad (Haley Bennett), the woman at the center of “Swallow,” for a mid-20th-century housewife: She dotes on her husband while wearing pearls and cocktail dresses and has a Jackie Kennedy bounce to her bob. The one deviation is playing iPhone games to relieve her ennui.","url":"https://www.nytimes.com/2020/03/05/movies/swallow-review.html","wordCount":259,"source":"The New York Times","subject":"Buisness","articleNumber":0,"day":2,"_id":"erBYHURWDBH7pn0w"},{"headline":"Dogs Can Detect Heat With 'Infrared Sensor' in Their Nose, Research Finds","abstract":"Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T16:56:55+0000","firstPara":"BUDAPEST — Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","url":"https://www.nytimes.com/reuters/2020/03/03/world/europe/03reuters-hungary-science-dogs.html","wordCount":269,"source":"Reuters","subject":"Buisness","articleNumber":2,"day":2,"_id":"hjmk92lchQrFjWN7"},{"headline":"Trump Campaign Sues Washington Post Over Opinion Pieces, After Suing NY Times","abstract":"U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T22:57:27+0000","firstPara":"NEW YORK — U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","url":"https://www.nytimes.com/reuters/2020/03/03/us/politics/03reuters-usa-election-trump-lawsuit.html","wordCount":489,"source":"Reuters","subject":"Buisness","articleNumber":6,"day":2,"_id":"oQgjhaQ5jdSJ6y86"},{"headline":"A Striking Balance of New and Rediscovered at the Independent Fair","abstract":"In this year’s whimsical edition, the 11-year-old art fair looks back to lesser-known work from the 1960s.","imageReference":"https://static01.nyt.com/images/2020/03/05/arts/05independent-combo/05independent-combo-articleLarge.jpg","author":"By Will Heinrich","publicationDate":"2020-03-05T21:54:40+0000","firstPara":"Looking out the windows of Spring Studios in upscale TriBeCa during this year’s 11th Independent Art Fair, I thought about the cycle of fashion. There are spectacular views of the teardrop-shaped roadway that leads out of the Holland Tunnel; on the same site, some two centuries ago, stood an exclusive gated park. Sooner or later, everything old is new again, and the most striking presentations in this fair, founded in 2010 by Elizabeth Dee to provide a curated alternative to larger art fairs, are revivals of work from the 1980s, the 1960s, or even earlier.","url":"https://www.nytimes.com/2020/03/05/arts/design/independent-art-fair-review.html","wordCount":1129,"source":"The New York Times","subject":"Buisness","articleNumber":4,"day":2,"_id":"ouzQowRBT01EHtod"},{"headline":"U.S. State Department Approves Possible $2.4 Billion Sale of 8 KC-46 Jets to Israel: Pentagon","abstract":"The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-04T04:59:21+0000","firstPara":"WASHINGTON — The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","url":"https://www.nytimes.com/reuters/2020/03/03/world/middleeast/03reuters-usa-israel-kc-46.html","wordCount":92,"source":"Reuters","subject":"Buisness","articleNumber":3,"day":2,"_id":"pnK0uNSdb5RzOEfQ"},{"headline":"How to Stop Touching Your Face","abstract":"We know it’s hard. Try these four tricks to help limit the number of times you touch your face each day to help prevent the spread of the coronavirus.","imageReference":"noImage","author":"By Jenny Gross","publicationDate":"2020-03-05T12:03:00+0000","firstPara":"Now that we know that it’s bad to touch our faces, how do we break a habit that most of us didn’t know we had?","url":"https://www.nytimes.com/2020/03/05/health/stop-touching-your-face-coronavirus.html","wordCount":671,"source":"The New York Times","subject":"Buisness","articleNumber":5,"day":2,"_id":"sLJ2oMSyg0CUTAYP"},{"headline":"Consent the Key in Spain's New Sex Crimes Draft Bill","abstract":"The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T13:56:15+0000","firstPara":"MADRID — The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","url":"https://www.nytimes.com/aponline/2020/03/03/world/europe/ap-eu-spain-sex-crimes-law.html","wordCount":222,"source":"AP","subject":"Buisness","articleNumber":7,"day":2,"_id":"xfR5TCrpQ3M4oJgO"}],"Engineering":[{"headline":"‘Swallow’ Review: Objects in Stomach May Be Sharper Than They Appear","abstract":"Haley Bennett plays a woman whose dangerous new habit is presented as a way to gain control over her life.","imageReference":"https://static01.nyt.com/images/2020/03/04/arts/04swallowpix/merlin_169651200_a30cb9a8-1eb2-4848-853b-b0f3f92d4136-articleLarge.jpg","author":"By Kristen Yoonsoo Kim","publicationDate":"2020-03-05T12:00:07+0000","firstPara":"It’s easy to mistake Hunter Conrad (Haley Bennett), the woman at the center of “Swallow,” for a mid-20th-century housewife: She dotes on her husband while wearing pearls and cocktail dresses and has a Jackie Kennedy bounce to her bob. The one deviation is playing iPhone games to relieve her ennui.","url":"https://www.nytimes.com/2020/03/05/movies/swallow-review.html","wordCount":259,"source":"The New York Times","subject":"Engineering","articleNumber":0,"day":2,"_id":"1CulCxObkqPyJSCc"},{"headline":"U.S. State Department Approves Possible $2.4 Billion Sale of 8 KC-46 Jets to Israel: Pentagon","abstract":"The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-04T04:59:21+0000","firstPara":"WASHINGTON — The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","url":"https://www.nytimes.com/reuters/2020/03/03/world/middleeast/03reuters-usa-israel-kc-46.html","wordCount":92,"source":"Reuters","subject":"Engineering","articleNumber":3,"day":2,"_id":"2YCrJaYkdRwQZ2tb"},{"headline":"Myanmar Army Sues Reuters for Criminal Defamation: Police","abstract":"Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-09T15:54:09+0000","firstPara":"(Reuters) - Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","url":"https://www.nytimes.com/reuters/2020/03/09/world/asia/09reuters-myanmar-reuters.html","wordCount":622,"source":"Reuters","subject":"Engineering","articleNumber":9,"day":2,"_id":"KDc5dfni8xpW7WgZ"},{"headline":"Trump Campaign Sues Washington Post Over Opinion Pieces, After Suing NY Times","abstract":"U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T22:57:27+0000","firstPara":"NEW YORK — U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","url":"https://www.nytimes.com/reuters/2020/03/03/us/politics/03reuters-usa-election-trump-lawsuit.html","wordCount":489,"source":"Reuters","subject":"Engineering","articleNumber":6,"day":2,"_id":"Qid6Vwlj2fUCfeTp"},{"headline":"German Police: At Least 7 Involved in Dresden Jewelry Theft","abstract":"At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-05T14:08:10+0000","firstPara":"BERLIN — At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","url":"https://www.nytimes.com/aponline/2020/03/05/world/europe/ap-eu-germany-stolen-treasures.html","wordCount":231,"source":"AP","subject":"Engineering","articleNumber":8,"day":2,"_id":"RtdOoolK1G12L6YL"},{"headline":"Dogs Can Detect Heat With 'Infrared Sensor' in Their Nose, Research Finds","abstract":"Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T16:56:55+0000","firstPara":"BUDAPEST — Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","url":"https://www.nytimes.com/reuters/2020/03/03/world/europe/03reuters-hungary-science-dogs.html","wordCount":269,"source":"Reuters","subject":"Engineering","articleNumber":2,"day":2,"_id":"gN2AidSty3F6OdYO"},{"headline":"Consent the Key in Spain's New Sex Crimes Draft Bill","abstract":"The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T13:56:15+0000","firstPara":"MADRID — The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","url":"https://www.nytimes.com/aponline/2020/03/03/world/europe/ap-eu-spain-sex-crimes-law.html","wordCount":222,"source":"AP","subject":"Engineering","articleNumber":7,"day":2,"_id":"izHTXPS7hDPHNGPK"},{"headline":"A Striking Balance of New and Rediscovered at the Independent Fair","abstract":"In this year’s whimsical edition, the 11-year-old art fair looks back to lesser-known work from the 1960s.","imageReference":"https://static01.nyt.com/images/2020/03/05/arts/05independent-combo/05independent-combo-articleLarge.jpg","author":"By Will Heinrich","publicationDate":"2020-03-05T21:54:40+0000","firstPara":"Looking out the windows of Spring Studios in upscale TriBeCa during this year’s 11th Independent Art Fair, I thought about the cycle of fashion. There are spectacular views of the teardrop-shaped roadway that leads out of the Holland Tunnel; on the same site, some two centuries ago, stood an exclusive gated park. Sooner or later, everything old is new again, and the most striking presentations in this fair, founded in 2010 by Elizabeth Dee to provide a curated alternative to larger art fairs, are revivals of work from the 1980s, the 1960s, or even earlier.","url":"https://www.nytimes.com/2020/03/05/arts/design/independent-art-fair-review.html","wordCount":1129,"source":"The New York Times","subject":"Engineering","articleNumber":4,"day":2,"_id":"l1LKsmAS9ELVvsjz"},{"headline":"How to Stop Touching Your Face","abstract":"We know it’s hard. Try these four tricks to help limit the number of times you touch your face each day to help prevent the spread of the coronavirus.","imageReference":"noImage","author":"By Jenny Gross","publicationDate":"2020-03-05T12:03:00+0000","firstPara":"Now that we know that it’s bad to touch our faces, how do we break a habit that most of us didn’t know we had?","url":"https://www.nytimes.com/2020/03/05/health/stop-touching-your-face-coronavirus.html","wordCount":671,"source":"The New York Times","subject":"Engineering","articleNumber":5,"day":2,"_id":"t2z7FVPl2Uvupgnv"},{"headline":"Reward for Info on Slain Dolphins Increases to $54,000","abstract":"A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T00:26:38+0000","firstPara":"ST. PETERSBURG, Fla. — A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","url":"https://www.nytimes.com/aponline/2020/03/02/us/ap-us-slain-dolphins.html","wordCount":210,"source":"AP","subject":"Engineering","articleNumber":1,"day":2,"_id":"ug7Tr9pwefOAu91g"}],"Geography":[{"headline":"Myanmar Army Sues Reuters for Criminal Defamation: Police","abstract":"Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-09T15:54:09+0000","firstPara":"(Reuters) - Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","url":"https://www.nytimes.com/reuters/2020/03/09/world/asia/09reuters-myanmar-reuters.html","wordCount":622,"source":"Reuters","subject":"Geography","articleNumber":8,"day":2,"_id":"CfyuKnzAwekdyoLh"},{"headline":"U.S. State Department Approves Possible $2.4 Billion Sale of 8 KC-46 Jets to Israel: Pentagon","abstract":"The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-04T04:59:21+0000","firstPara":"WASHINGTON — The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","url":"https://www.nytimes.com/reuters/2020/03/03/world/middleeast/03reuters-usa-israel-kc-46.html","wordCount":92,"source":"Reuters","subject":"Geography","articleNumber":3,"day":2,"_id":"IVrdqzEsobe6QOvw"},{"headline":"Trump Campaign Sues Washington Post Over Opinion Pieces, After Suing NY Times","abstract":"U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T22:57:27+0000","firstPara":"NEW YORK — U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","url":"https://www.nytimes.com/reuters/2020/03/03/us/politics/03reuters-usa-election-trump-lawsuit.html","wordCount":489,"source":"Reuters","subject":"Geography","articleNumber":6,"day":2,"_id":"OJMthWPrbLKK9KJK"},{"headline":"‘Swallow’ Review: Objects in Stomach May Be Sharper Than They Appear","abstract":"Haley Bennett plays a woman whose dangerous new habit is presented as a way to gain control over her life.","imageReference":"https://static01.nyt.com/images/2020/03/04/arts/04swallowpix/merlin_169651200_a30cb9a8-1eb2-4848-853b-b0f3f92d4136-articleLarge.jpg","author":"By Kristen Yoonsoo Kim","publicationDate":"2020-03-05T12:00:07+0000","firstPara":"It’s easy to mistake Hunter Conrad (Haley Bennett), the woman at the center of “Swallow,” for a mid-20th-century housewife: She dotes on her husband while wearing pearls and cocktail dresses and has a Jackie Kennedy bounce to her bob. The one deviation is playing iPhone games to relieve her ennui.","url":"https://www.nytimes.com/2020/03/05/movies/swallow-review.html","wordCount":259,"source":"The New York Times","subject":"Geography","articleNumber":0,"day":2,"_id":"S6nSJyft39JbIXGr"},{"headline":"A Striking Balance of New and Rediscovered at the Independent Fair","abstract":"In this year’s whimsical edition, the 11-year-old art fair looks back to lesser-known work from the 1960s.","imageReference":"https://static01.nyt.com/images/2020/03/05/arts/05independent-combo/05independent-combo-articleLarge.jpg","author":"By Will Heinrich","publicationDate":"2020-03-05T21:54:40+0000","firstPara":"Looking out the windows of Spring Studios in upscale TriBeCa during this year’s 11th Independent Art Fair, I thought about the cycle of fashion. There are spectacular views of the teardrop-shaped roadway that leads out of the Holland Tunnel; on the same site, some two centuries ago, stood an exclusive gated park. Sooner or later, everything old is new again, and the most striking presentations in this fair, founded in 2010 by Elizabeth Dee to provide a curated alternative to larger art fairs, are revivals of work from the 1980s, the 1960s, or even earlier.","url":"https://www.nytimes.com/2020/03/05/arts/design/independent-art-fair-review.html","wordCount":1129,"source":"The New York Times","subject":"Geography","articleNumber":4,"day":2,"_id":"TQaAiLRDU7YtQ2AK"},{"headline":"Dogs Can Detect Heat With 'Infrared Sensor' in Their Nose, Research Finds","abstract":"Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T16:56:55+0000","firstPara":"BUDAPEST — Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","url":"https://www.nytimes.com/reuters/2020/03/03/world/europe/03reuters-hungary-science-dogs.html","wordCount":269,"source":"Reuters","subject":"Geography","articleNumber":2,"day":2,"_id":"WNto9CrI2odvmtRG"},{"headline":"German Police: At Least 7 Involved in Dresden Jewelry Theft","abstract":"At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-05T14:08:10+0000","firstPara":"BERLIN — At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","url":"https://www.nytimes.com/aponline/2020/03/05/world/europe/ap-eu-germany-stolen-treasures.html","wordCount":231,"source":"AP","subject":"Geography","articleNumber":9,"day":2,"_id":"nVleHJXQ7QDfOtwA"},{"headline":"Consent the Key in Spain's New Sex Crimes Draft Bill","abstract":"The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T13:56:15+0000","firstPara":"MADRID — The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","url":"https://www.nytimes.com/aponline/2020/03/03/world/europe/ap-eu-spain-sex-crimes-law.html","wordCount":222,"source":"AP","subject":"Geography","articleNumber":7,"day":2,"_id":"tOkremkueQNQ1UJB"},{"headline":"How to Stop Touching Your Face","abstract":"We know it’s hard. Try these four tricks to help limit the number of times you touch your face each day to help prevent the spread of the coronavirus.","imageReference":"noImage","author":"By Jenny Gross","publicationDate":"2020-03-05T12:03:00+0000","firstPara":"Now that we know that it’s bad to touch our faces, how do we break a habit that most of us didn’t know we had?","url":"https://www.nytimes.com/2020/03/05/health/stop-touching-your-face-coronavirus.html","wordCount":671,"source":"The New York Times","subject":"Geography","articleNumber":5,"day":2,"_id":"uNIdLaBSXY0DTyaZ"},{"headline":"Reward for Info on Slain Dolphins Increases to $54,000","abstract":"A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T00:26:38+0000","firstPara":"ST. PETERSBURG, Fla. — A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","url":"https://www.nytimes.com/aponline/2020/03/02/us/ap-us-slain-dolphins.html","wordCount":210,"source":"AP","subject":"Geography","articleNumber":1,"day":2,"_id":"vFjaQ82vn4Jd9594"}],"Literature":[{"headline":"How to Stop Touching Your Face","abstract":"We know it’s hard. Try these four tricks to help limit the number of times you touch your face each day to help prevent the spread of the coronavirus.","imageReference":"noImage","author":"By Jenny Gross","publicationDate":"2020-03-05T12:03:00+0000","firstPara":"Now that we know that it’s bad to touch our faces, how do we break a habit that most of us didn’t know we had?","url":"https://www.nytimes.com/2020/03/05/health/stop-touching-your-face-coronavirus.html","wordCount":671,"source":"The New York Times","subject":"Literature","articleNumber":5,"day":2,"_id":"0xDutFwtneapqBDx"},{"headline":"Consent the Key in Spain's New Sex Crimes Draft Bill","abstract":"The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T13:56:15+0000","firstPara":"MADRID — The Spanish government Tuesday approved a new draft bill on sex crimes that makes consent a key determinant in cases, freeing victims of having to prove that violence or intimidation was used against them.","url":"https://www.nytimes.com/aponline/2020/03/03/world/europe/ap-eu-spain-sex-crimes-law.html","wordCount":222,"source":"AP","subject":"Literature","articleNumber":7,"day":2,"_id":"2iltC8nfR9X6QKYW"},{"headline":"Reward for Info on Slain Dolphins Increases to $54,000","abstract":"A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-03T00:26:38+0000","firstPara":"ST. PETERSBURG, Fla. — A reward for information about the recent deaths of two slain Dolphins along Florida's Gulf Coast has increased to $54,000, officials said.","url":"https://www.nytimes.com/aponline/2020/03/02/us/ap-us-slain-dolphins.html","wordCount":210,"source":"AP","subject":"Literature","articleNumber":1,"day":2,"_id":"5Z6NMg0xnmpkEZBb"},{"headline":"U.S. State Department Approves Possible $2.4 Billion Sale of 8 KC-46 Jets to Israel: Pentagon","abstract":"The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-04T04:59:21+0000","firstPara":"WASHINGTON — The U.S. State Department has approved a possible $2.4 billion sale of eight KC-46 refueling tanker jets to Israel, the Defense Security Cooperation Agency said on Tuesday in an official notification to Congress.","url":"https://www.nytimes.com/reuters/2020/03/03/world/middleeast/03reuters-usa-israel-kc-46.html","wordCount":92,"source":"Reuters","subject":"Literature","articleNumber":3,"day":2,"_id":"ExnkhoyMZOp6RKn1"},{"headline":"‘Swallow’ Review: Objects in Stomach May Be Sharper Than They Appear","abstract":"Haley Bennett plays a woman whose dangerous new habit is presented as a way to gain control over her life.","imageReference":"https://static01.nyt.com/images/2020/03/04/arts/04swallowpix/merlin_169651200_a30cb9a8-1eb2-4848-853b-b0f3f92d4136-articleLarge.jpg","author":"By Kristen Yoonsoo Kim","publicationDate":"2020-03-05T12:00:07+0000","firstPara":"It’s easy to mistake Hunter Conrad (Haley Bennett), the woman at the center of “Swallow,” for a mid-20th-century housewife: She dotes on her husband while wearing pearls and cocktail dresses and has a Jackie Kennedy bounce to her bob. The one deviation is playing iPhone games to relieve her ennui.","url":"https://www.nytimes.com/2020/03/05/movies/swallow-review.html","wordCount":259,"source":"The New York Times","subject":"Literature","articleNumber":0,"day":2,"_id":"XWEYEvI0btamtsa8"},{"headline":"Myanmar Army Sues Reuters for Criminal Defamation: Police","abstract":"Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-09T15:54:09+0000","firstPara":"(Reuters) - Myanmar police said the army had filed a lawsuit against Reuters news agency and a local lawmaker for criminal defamation, weeks after the military objected to a news story published about the death of two Rohingya Muslim women as a result of shelling in Rakhine state.","url":"https://www.nytimes.com/reuters/2020/03/09/world/asia/09reuters-myanmar-reuters.html","wordCount":622,"source":"Reuters","subject":"Literature","articleNumber":8,"day":2,"_id":"akCtPgPKkGYluMYc"},{"headline":"Trump Campaign Sues Washington Post Over Opinion Pieces, After Suing NY Times","abstract":"U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T22:57:27+0000","firstPara":"NEW YORK — U.S. President Donald Trump's re-election campaign sued the Washington Post for libel on Tuesday over two opinion pieces that it said suggested improper ties between the campaign and Russia, North Korea or both.","url":"https://www.nytimes.com/reuters/2020/03/03/us/politics/03reuters-usa-election-trump-lawsuit.html","wordCount":489,"source":"Reuters","subject":"Literature","articleNumber":6,"day":2,"_id":"gB2AUzgMY8Iv2kJS"},{"headline":"Dogs Can Detect Heat With 'Infrared Sensor' in Their Nose, Research Finds","abstract":"Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","imageReference":"noImage","author":"By Reuters","publicationDate":"2020-03-03T16:56:55+0000","firstPara":"BUDAPEST — Dogs have a type of infrared sensor in the tip of their nose which enables them to detect minute changes in temperature such as when other animals are nearby, according to new research. ","url":"https://www.nytimes.com/reuters/2020/03/03/world/europe/03reuters-hungary-science-dogs.html","wordCount":269,"source":"Reuters","subject":"Literature","articleNumber":2,"day":2,"_id":"nXSFXLzTKmuwpvnM"},{"headline":"A Striking Balance of New and Rediscovered at the Independent Fair","abstract":"In this year’s whimsical edition, the 11-year-old art fair looks back to lesser-known work from the 1960s.","imageReference":"https://static01.nyt.com/images/2020/03/05/arts/05independent-combo/05independent-combo-articleLarge.jpg","author":"By Will Heinrich","publicationDate":"2020-03-05T21:54:40+0000","firstPara":"Looking out the windows of Spring Studios in upscale TriBeCa during this year’s 11th Independent Art Fair, I thought about the cycle of fashion. There are spectacular views of the teardrop-shaped roadway that leads out of the Holland Tunnel; on the same site, some two centuries ago, stood an exclusive gated park. Sooner or later, everything old is new again, and the most striking presentations in this fair, founded in 2010 by Elizabeth Dee to provide a curated alternative to larger art fairs, are revivals of work from the 1980s, the 1960s, or even earlier.","url":"https://www.nytimes.com/2020/03/05/arts/design/independent-art-fair-review.html","wordCount":1129,"source":"The New York Times","subject":"Literature","articleNumber":4,"day":2,"_id":"uMRCvuYooIU4ODvT"},{"headline":"German Police: At Least 7 Involved in Dresden Jewelry Theft","abstract":"At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","imageReference":"noImage","author":"By The Associated Press","publicationDate":"2020-03-05T14:08:10+0000","firstPara":"BERLIN — At least seven people were involved in the November theft of 18th-century jewels from a unique collection in Dresden, German authorities said Thursday as they released a sketch of one possible suspect.","url":"https://www.nytimes.com/aponline/2020/03/05/world/europe/ap-eu-germany-stolen-treasures.html","wordCount":231,"source":"AP","subject":"Literature","articleNumber":9,"day":2,"_id":"zMJoBUrnNJcMvXry"}]}

    return fakeArray
}
