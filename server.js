var fs = require('fs')
var crypto = require('crypto')
var express = require('express')
var path = require('path')
var app = express()

function loadUsers(){
    try{
        var users = fs.readFileSync('users.txt', {'encoding':'utf8'})
        var userList2 = users.split('\n')
        var result = []
        for(var i=0;i<userList2.length-1;i++)
        {
            var user = userList2[i]
            user = user.split(',')
            var obj = {'username':user[0], 'password':user[1], 'usertype':user[2]}
            result.push(obj)
        }
        return result
    }catch(err){
        console.log(err)
        return []
    }
}

var userList = loadUsers()

function checkLogin(username, password){
    for(var i=0;i<userList.length;i++)
    {
        var user = userList[i]
        var hashedPass = crypto.createHash('sha256').update(password).digest('hex')
        if((user.username==username)&&(user.password==hashedPass)){
            return true
        }
    }
    return false
}

function checkAdmin(username){
    for(var i=0;i<userList.length;i++){
        var user = userList[i]
        if((user.username==username)&&(user.usertype=='admin'))
        {
            return true
        }
    }
    return false
}

var publicFolder = path.join(__dirname, '/')

app.get('/home', function(req, res){
    res.sendFile(path.join(publicFolder, 'home.html'))
})
app.get('/style.css', function(req, res){
    res.sendFile(path.join(publicFolder, 'style.css'))
})
app.post('/home', express.json(), function(req, res){
    if(checkAdmin(req.body.username)){
        res.sendFile(path.join(publicFolder, 'home_admin.html'))
    }
    else{
        res.sendFile(path.join(publicFolder, 'home.html'))
    }
})

function findPromise(){
    // TODO
}

app.post('/manage', express.json(), function(req, res){
    if(checkAdmin(req.body.username)){
        res.sendFile(path.join(publicFolder, 'manage.html'))
    }
})
app.post('/mng_action', express.urlencoded({'extended':true}), function(req, res){


    try{
        var courseDoc = {
            'courseid':req.body.courseid,
            'coursename':req.body.coursename,
            'description':req.body.description
        }
        insertPromise('courses', courseDoc)
    }catch(err){
        console.log(err)
    }

    res.send('Inserting the course ...')
})
app.post('/view', express.urlencoded({'extended':true}), function(req, res){
    res.sendFile(path.join(publicFolder, 'view.html'))
})
app.get('/getCourses', function(req, res){
    // TODO
})
app.get('/source.js', function(req, res){
    res.sendFile(path.join(publicFolder, 'source.js'))
})
app.post('/create_user', express.json(), function(req, res){
    res.sendFile(path.join(publicFolder, 'create_user.html'))
})
app.post('/create_action', express.urlencoded({'extended':true}), function(req, res){
    var hashedPass = crypto.createHash('sha256').update(req.body.password).digest('hex')

    userList.push({'username':req.body.username, 'password':hashedPass, 'usertype':req.body.usertype})
    console.log('Number of users:', userList.length)

    try{
        var user = `${req.body.username},${hashedPass},${req.body.usertype}\n`
        fs.appendFileSync('users.txt', user, {'encoding':'utf8'})
    }catch(err){
        console.log(err)
    }

    res.sendFile(path.join(publicFolder, 'create_action.html'))
})
app.post('/login', express.json(), function(req, res){
    res.sendFile(path.join(publicFolder, 'login.html'))
})
app.post('/lgn_action', express.urlencoded({'extended':true}), function(req, res){
    if(checkLogin(req.body.username, req.body.password)){
        res.sendFile(path.join(publicFolder, 'lgn_action.html'))
    }
    else{
        res.sendFile(path.join(publicFolder, 'lgn_action_failure.html'))
    }
})

app.listen(3000, function(){})