
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
    .then(function(docs){
        //console.log(docs)
        var p = document.getElementById('my_p')
        p.innerHTML = JSON.stringify(docs)
    })
    .catch(function(err){
        console.log(err)
    })
}