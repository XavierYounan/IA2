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

       

        let div = document.createElement('div')
        div.id = "article"
        
        let headline = document.createElement("h2")
        headline.innerHTML = article.headline
        div.appendChild(headline)

        let abstract = document.createElement("h3")
        abstract.innerHTML = article.abstract
        div.appendChild(abstract)

        console.log("image reference is : " + article.imageReference)
        //Insert image here

        let author = document.createElement("p2")
        author.innerHTML = article.author
        div.appendChild(author)

        let publicationDate = document.createElement("p3")
        publicationDate.innerHTML = article.publicationDate
        div.appendChild(publicationDate)

        let firstPara = document.createElement("p1")
        firstPara.innerHTML = article.firstPara
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

        document.getElementById("ArticleHolder").appendChild(div)
        
        /*}else{
            let headline = document.createElement('h2')
            headline.innerHTML = "ERROR, Article not defined, code: " + article.code
            $("#ArticleHolder").append(headline)
            //Do nothing for now 
        }*/
    }
}
