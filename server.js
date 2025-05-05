var fs = require('fs')
var crypto = require('crypto')
var express = require('express')
var path = require('path')
var app = express()

function loadUsers(){
    try{
        var users = fs.readFileSync(path.resolve(__dirname, 'users.txt'), {'encoding':'utf8'})
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

var loggedUser = null;

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

app.get('/', function(req, res){
    res.sendFile(path.join(publicFolder, 'home.html'))
})
app.get('/home', function(req, res){
    res.sendFile(path.join(publicFolder, 'home.html'))
})
app.get('/style1.css', function(req, res){
    res.sendFile(path.join(publicFolder, 'style1.css'))
})
app.get('/style2.css', function(req, res){
    res.sendFile(path.join(publicFolder, 'style2.css'))
})
app.get('/style3.css', function(req, res){
    res.sendFile(path.join(publicFolder, 'style3.css'))
})
app.post('/home', express.json(), function(req, res){
    if(checkAdmin(req.body.username) && loggedUser!=null){
        res.sendFile(path.join(publicFolder, 'home_admin.html'))
    }else{
        if (loggedUser!=null){
            res.sendFile(path.join(publicFolder, 'home_student.html'))
        } else {
            res.sendFile(path.join(publicFolder, 'home.html'))
        }
    }
})
app.get('/source.js', function(req, res){
    res.sendFile(path.join(publicFolder, 'source.js'))
})

function findPromise(courseName){
    var studentName = loggedUser[0]
    var student = null
    var course = null
    if (!studentName){
        return false
    }
    userList = loadUsers()
    for (var i=0;i<userList.length;i++){
        var user = userList[i]
        if (user.username == studentName){
            student = user
            break
        }
    }
    if (!student) {
        console.error("Student not found in users");
        return false;
    }
    var courses = fs.readFileSync(path.resolve(__dirname, 'courses.txt'), {'encoding':'utf8'})
    var courseList = courses.trim().split('\n')
    for (var i = 0; i < courseList.length; i++) {
        if (!courseList[i].trim()) continue;
        try {
            var courseObj = JSON.parse(courseList[i]);
            if (courseObj.coursename == courseName) {
                course = courseObj;
                break;
            }
        } catch (err) {
            console.error("Invalid course line:", i);
        }
    }
    if (!course) {
        console.error("Course not found in course.txt");
        return false;
    }
    try{
        var obj = {'student':student, 'course':course}
        fs.appendFileSync(path.resolve(__dirname, 'userAndCourse.txt'), JSON.stringify(obj) + '\n');
    }
    catch(err){
        console.log(err)
    }
    return true
}

function insertPromise(courseObj){
    fs.appendFile(path.resolve(__dirname, 'courses.txt'), JSON.stringify(courseObj) + '\n', (err) => {
        if(err){
            console.error("An error occured:", err);
        }
        else {
            console.log("Object was written to file!")
        }
    });
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
        insertPromise(courseDoc)
    }catch(err){
        console.log(err)
        return;
    }
    res.sendFile(path.join(publicFolder, 'mng_action.html'))
})
app.post('/view', express.urlencoded({'extended': true }), function(req, res){
    if (loggedUser==null){
        res.sendFile(path.join(publicFolder, 'view.html'))
    } else {
        if (checkAdmin(loggedUser[0])){
            res.sendFile(path.join(publicFolder, 'view.html'))
        } else {
            res.sendFile(path.join(publicFolder, 'view_logged.html'))
        }
    }
})
app.post('/create_user', express.json(), function(req, res){
    res.sendFile(path.join(publicFolder, 'create_user.html'))
})
app.post('/logged_out', express.json(), function(req, res){
    loggedUser=null
    res.sendFile(path.join(publicFolder, 'logged_out.html'))
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
        loggedUser=[req.body.username, req.body.password]
        res.sendFile(path.join(publicFolder, 'lgn_action.html'))
    }
    else{
        res.sendFile(path.join(publicFolder, 'lgn_action_failure.html'))
    }
})

app.get('/getCourses', (req, res) => {
    if (loggedUser != null && !checkAdmin(loggedUser[0])){
        var content = fs.readFileSync(path.resolve(__dirname, 'userAndCourse.txt'), 'utf8');
        var lines = content.split('\n').filter(line => line.trim());
        var filteredCourses = [];

        for (let line of lines) {
            try {
                var entry = JSON.parse(line);
                if (entry.student.username == loggedUser[0]) {
                    filteredCourses.push(entry.course);
                }
            } catch (err) {
                console.error("Invalid entry in userAndCourse.txt:", err.message);
            }
        }

        res.json(filteredCourses);
        return
    }
    else{
        var filePath = path.resolve(__dirname, 'courses.txt')
        try {
            var content = fs.readFileSync(filePath, 'utf8');
            var lines = content.split('\n').filter(line => line.trim())
            var courses = lines.map(line => JSON.parse(line))
            res.json(courses);
        } catch (err) {
            console.error("Failed to read courses.txt", err)
            res.status(500).json({ error: 'Failed to load courses' })
        }
    }
    
})
app.listen(3000, function(){})
