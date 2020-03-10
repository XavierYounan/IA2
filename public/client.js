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

requestArticles()

async function requestArticles(){
    

    const response = await fetch('/getArticles', {method: 'post'});
    const json = await response.json();
    const articles = json.articles
    
    
    let noArticles = articles.length


    for(var i=0; i<noArticles; i++){
        var article = articles[i]
        
        //console.log(article) //Temp
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
        */

        
       

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
            console.log("no image")
        }else{
            let img = document.createElement('img');
            img.className = "right"
            img.src =  imageRef
            div2.appendChild(img)
            console.log("image, src: " + imageRef)
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

        console.log(dateObj)
        
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
        

        //add all divs
        div3.appendChild(div4);
        div.appendChild(div3);

        //add full div to page
        var container = document.getElementById('contentContainer');
        container.appendChild(div);
    }
}
