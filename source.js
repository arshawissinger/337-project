function storeUser(){
    var username = document.getElementById('username').value
    window.localStorage.setItem('username', username)
}
function updateUrls()
{
    var username = window.localStorage.getItem('username')
    if(username!=null){
        var alist = document.getElementsByTagName('a')
        for(var i=0;i<alist.length;i++)
        {
            var par = '?username=' + username
            alist[i].href += par
        }
    }
}
function switchTheme(theme) {
    var link = document.getElementsByTagName('link')[0]
    if (link){
        link.href=theme
    }
    localStorage.setItem('theme', theme)
}
function sendReq(url){
    var username = window.localStorage.getItem('username')
    var body = {}
    if(username!=null){
        body = {'username':username}
    }
    fetch(url, {
        'headers': {'Content-Type': 'application/json'},
        'method': 'POST',
        'body': JSON.stringify(body)
    })
    .then(function(res){
        return res.text()
    })
    .then(function(text){
        document.open()
        document.write(text)
        document.close()
    })
    .catch(function(err){
        console.log(err)
    })
}

function getCourses(){
    fetch('getCourses')
    .then(function(res){
        return res.json()
    })
    .then(docs =>{
        var p = document.getElementById('my_p');

        docs.forEach(course => {
            p.innerHTML += `
                <div>
                    <h2>${course.coursename}</h2>
                    <p>ID: ${course.courseid}</p>
                    <p>${course.description}</p>
                </div>
            `;
        });
    })
    .catch(err => {
        document.getElementById('my_p').innerText = "Error loading courses.";
    });
}

function enrollCourses(){
    fetch('enrollCourses')
    .then(function(res){
        return res.json()
    })
    .then(docs =>{
        var p = document.getElementById('enroll');

        docs.forEach(course => {
            p.innerHTML += `
                <input type="checkbox" name="coursename" value="${course.coursename}">${course.coursename}</input>
                <p>${course.description}</p>   
            `;
        });
        p.innerHTML+= '<input type="submit"></input>'
    })
    .catch(err => {
        document.getElementById('enroll').innerText = "Error loading courses.";
    });
}
