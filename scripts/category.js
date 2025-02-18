// call server to request post of that category

var categoryUser;
var filterUser;

window.addEventListener("load", function(evt) {
    categoryUser = getCategoryType();
    getCategoryPosts();
})

function getCategoryPosts() {

    // get filter value
    filterUser = document.getElementById("filterMenu").value;

    var xhttp = new XMLHttpRequest();
    xhttp.responseType = 'json';
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { // call is complete and call is successful

            var result = this.response; 

            if (result == "unsuccessful") {
                console.log("Error: occurred in getting posts");
            }
            else if (result == null) {
                console.log("no posts exists");
            }
            else {

                var container = document.getElementById("container");
                container.innerHTML = "";
                var picturesID = Object.keys(this.response[0]); 
                var pictures = Object.values(this.response[0]);

                var picHostedLink;
                var picTitle;
                var postID;

                for(let i = 0; i < pictures.length; i++){
                    picHostedLink = pictures[i].ImageURL;
                    picTitle = pictures[i].Caption;
                    postID = picturesID[i]; 
                    container.innerHTML += "<div class=\"box\">" +
                                                "<form action=\"../views/photo.html\">" + 
                                                    "<input type=\"hidden\" name=\"postID\" value=\"" + postID + "\"/>" +
                                                        "<button class=\"btn\" type=\"submit\" id=\"categoryButton\">" + 
                                                            "<div class=\"imgBox\">" +
                                                                "<img src=\"" + picHostedLink + "\">" + 
                                                            "</div>" +
                                                            "<div class=\"content\">" +
                                                                "<h2>" + picTitle + "</h2>" +
                                                            "</div>" +
                                                        "</button>" + 
                                                "</form>"
                }
            }
        }
    };

    var params = "?" + "category=" + categoryUser + "&filter=" + filterUser; 
    xhttp.open("GET", "https://server-snowy-smoke-8305.fly.dev/GetCategoryPosts" + params, true); 
    xhttp.send();

}

function getCategoryType() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var categoryName = url.searchParams.get("categoryType");
    var categoryNameID = document.getElementById("category_name");
    categoryNameID.innerHTML = categoryName;
    return categoryName;
}