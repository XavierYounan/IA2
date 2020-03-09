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

requestArticles()

async function requestArticles(){

    const response = await fetch('/getArticles', {method: 'post'});
    const json = await response.json();
    const articles = json.articles
    
    
    let noArticles = articles.length


    for(var i=0; i<noArticles; i++){
        var article = articles[i]
        
        console.log(article) //Temp
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

        let headline = document.createElement("h1")
        headline.innerHTML = article.headline
        div.appendChild(headline)

        let hr = document.createElement("hr")
        div.appendChild(hr)

        let div2 = document.createElement('div')
        div2.className = 'in-content'

        let firstPara = document.createElement("p")
        firstPara.innerHTML = article.firstPara
        div2.appendChild(firstPara)

        let a = document.createElement('a')
        a.className = 'read-more'
        a.href = article.url
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

        div3.appendChild(div4)
        div.appendChild(div3)


        var container = document.getElementById('contentContainer')
        container.appendChild(div)


        /*
        let abstract = document.createElement("h3")
        abstract.innerHTML = article.abstract
        div.appendChild(abstract)

        console.log("image reference is : " + article.imageReference)
        //Insert image here

       

        let publicationDate = document.createElement("p3")
        publicationDate.innerHTML = article.publicationDate
        div.appendChild(publicationDate)

        let firstPara = document.createElement("p1")
        
        div.appendChild(firstPara)

        let url = document.createElement('a')
        url.innerHTML = "link" 
        url.href = article.url
        div.appendChild(url)

        let wordCount = document.createElement('a')
        wordCount.innerHTML = article.wordCount
        div.appendChild(wordCount)

        let source = document.createElement("p1")
        source.innerHTML = article.source + "<br>"
        div.appendChild(source)
        */

        //document.getElementById("ArticleHolder").appendChild(div)
        
        /*}else{
            let headline = document.createElement('h2')
            headline.innerHTML = "ERROR, Article not defined, code: " + article.code
            $("#ArticleHolder").append(headline)
            //Do nothing for now 
        }*/
    }
}
