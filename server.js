const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const app = express();
//nodemailer
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { response } = require('express');
const { request } = require('http');


const dbPath = path.join(__dirname, 'hackathon.db');


//MiddleWare
app.use(express.json());
app.use(express.static('main')); // useful for reading a file by server

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 9999 ;
//Initalization of Database and Server
let db = null ;
const initializeDbAndServer = async ()=>{
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        });
        

        app.listen(PORT, ()=>{
            console.log('Jai Hanuman...');
        });
    }
    catch(e){
        console.log(`Error Message is : ${e}`);
        process.exit(1);
    }

};
initializeDbAndServer();

app.get('/', (request, response)=>{
    response.sendFile('/main/homepage.html', {root:__dirname});
});
app.get('/admin/',(request, response)=>{
    response.sendFile('/main/AdminPage.html', {root:__dirname});
});

app.get('/promotion/', (request, response)=>{
    response.sendFile('/main/data/add1.mp4', {root:__dirname});
});
app.get('/login1/', (request, response)=>{
    response.sendFile('/main/loginStudent.html',{root:__dirname});
});
app.get('/login2/', (request, response)=>{
    response.sendFile('/main/loginFaculty.html',{root:__dirname});
});

app.get('/login3/', (request, response)=>{
    response.sendFile('/main/loginOrganizer.html',{root:__dirname});
});
app.get('/registration1/', (request, response)=>{
    response.sendFile('/main/registrationStudent.html',{root:__dirname});
});
app.get('/registration2/', (request, response)=>{
    response.sendFile('/main/registrationFaculty.html',{root:__dirname});
});
app.get('/registration3/', (request, response)=>{
    response.sendFile('/main/registrationOrganizer.html', {root:__dirname});
});

app.get('/event/', (request, response)=>{
    response.sendFile(path.join(__dirname, 'main','event-page.html'));
    //response.sendFile('main/event-page/event-page.html', {root:__dirname});
});
app.get('/event-form/',(request, response)=>{
    response.sendFile(path.join(__dirname, 'main', 'event-registration1.html'));
});

app.get('/analytics/', (request, response)=>{
    response.sendFile('/main/Analytics_dashboard.html', {root:__dirname});
});

app.post('/registerStudentCheck/', async (request, response)=>{
    const {username, email, password } = request.body ;
    const getquery = `
    SELECT * FROM student 
    WHERE email='${email}' ;
    `;
    const queryCheck = await db.get(getquery);
    if( queryCheck === undefined ){
        const passHash = await bcrypt.hash(password, 10);
        //console.log('inserting');
        const queryInsert = `
        INSERT INTO  student (username, email, password)
        VALUES ('${username}', '${email}', '${passHash}');
        `;
        //console.log('inserting 2 ');
        db.run(queryInsert, function(err) {
            //console.log('loading');
            if (err) {
                //console.log('Error in inserting');
                return response.status(500).json({ message : "failed" });
            }
        });
        //console.log("success.......................");
        response.status(200).json({ message: "success" });
    }
    else{
        //console.log('Already there right ? ');
        response.status(400).json({message : 'You are already registered! \n Please login...'})
    }
});

app.post('/loginStudentCheck', async (request, response)=>{

    const { email, password } = request.body;

    let loginStudentQuery = `
        SELECT * FROM student 
        WHERE email = '${email}';
    `; 
    let loginRes = await db.get(loginStudentQuery);
    if(loginRes === undefined){
        response.status(401).json({ message: 'emailFail' });
        //console.log('Email not found')
    }
    else{
        if(await bcrypt.compare(password, loginRes.password)){
            //console.log('successfully logined');
            response.json({ message: 'success' });
        }
        else{
            //console.log('password incorrect ');
            response.status(401).json({ message: 'passFail' });
        }
    }
});

app.post('/registerFacultyCheck/', async (request, response)=>{
    const {username, email, password } = request.body ;
    const getquery = `
    SELECT * FROM faculty 
    WHERE email='${email}' ;
    `;
    const queryCheck = await db.get(getquery);
    if( queryCheck === undefined ){
        const passHash = await bcrypt.hash(password, 10);
        //console.log('inserting');
        const queryInsert = `
        INSERT INTO faculty (username, email, password)
        VALUES ('${username}', '${email}', '${passHash}');
        `;
        //console.log('inserting 2 ');
        db.run(queryInsert, function(err) {
            //console.log('loading');
            if (err) {
                //console.log('Error in inserting');
                return response.status(500).json({ message : "failed" });
            }
        });
        //console.log("success.......................");
        response.status(200).json({ message: "success" });
    }
    else{
        //console.log('Already there right ? ');
        response.status(400).json({message : 'You are already registered! \n Please login...'})
    }
});

app.post('/loginFacultyCheck', async (request, response)=>{

    const { email, password } = request.body;

    let loginStudentQuery = `
        SELECT * FROM faculty 
        WHERE email = '${email}';
    `; 
    let loginRes = await db.get(loginStudentQuery);
    if(loginRes === undefined){
        response.status(401).json({ message: 'emailFail' });
        //console.log('Email not found');
    }
    else{
        if(await bcrypt.compare(password, loginRes.password)){
            //console.log('successfully logined');
            response.json({ message: 'success' });
        }
        else{
            //console.log('password incorrect ');
            response.status(401).json({ message: 'passFail' });
        }
    }
});

app.post('/loginOrganizerCheck/', async (request, response)=>{

    const { email, password } = request.body;

    let loginOrganizerQuery = `
        SELECT * FROM organiser
        WHERE email = '${email}';
    `; 
    let loginRes = await db.get(loginOrganizerQuery);
    if(loginRes === undefined){
        //console.log('Organizer Email not found');
        return response.status(401).json({ message: 'Your are not assigned as Event Organiser' });
    }
    else{
        if(await bcrypt.compare(password, loginRes.password)){
          //  console.log('successfully logined');
            return response.status(200).json({ message: 'success' });
        }
        else{
            //console.log('password incorrect ');
            return response.status(401).json({ message: 'Password is incorrect' });
        }
    }
});

app.post('/registrationOrganizerCheck/', (request, response)=>{
    const {email, password, reason} = request.body ;
    //console.log("Running.....");    
    var transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
        auth: {
            user: 'rgukteventmanagement2024@gmail.com',  //'rr200002@rguktrkv.ac.in', // replace with your email
            pass: 'yzoq fquu cwag zvtu'//'lfqj emox zijs umfu'   // replace with your email password or app-specific password
        }
    });
    const mailOptions = {
        from: 'rgukteventmanagement2024@gmail.com', // sender address
        to: 'harsha6300520145@gmail.com',//'rr200002@rguktrkv.ac.in',
        subject: 'Request for the roll Organizer',
        text:'',// `Email : ${email} \nPassword: ${password}\nReason: ${reason}`
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f5f5f5;
            padding: 0;
            margin: 0;
        }
        .container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-top: 20px;
        }
        .message {
            font-size: 1.5em;
            font-family: 'Caveat', cursive;
        }
        .closing {
            color: dimgrey;
            font-family: 'Roboto', sans-serif;
            font-weight: bold;
            margin: 10px 0;
        }
        .contact-info {
            font-family: 'Roboto', sans-serif;
        }
        @media (max-width: 576px) {
            .message {
                font-size: 1.2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12 text-left mb-4">
                <p>Hello,</p>
                <div class="message">
                    Student ${email} wants to be Event Organizer for the event. 
                </div>
                <div class="message">
                Reason : ${reason}
                </div>
            </div>
    </div>
    <!-- Optional: Bootstrap JS and dependencies -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return response.status(500).json({ message: 'Failed to send email.' });
        }
        });
    return response.status(200).json({ message : "success"});
});

app.post('/submit-event/', async (request, response)=>{
    const {email, year,date, category, event , number } = request.body ;
    var check = `
        SELECT * FROM registration 
        WHERE email='${email}' AND event_name='${event}' ;
    `;
    var checking =await db.get(check, function(err){
        return response.status(500).json({message : err });
    });
    if(checking===undefined){
        var query = `
        INSERT INTO registration (email, year, date, category_name, event_name, no_of_participants)
        VALUES ('${email}', '${year}', '${date}', '${category}', '${event}', ${number});
        `;
        await db.run(query, function(err){
            //console.log('error in registration', err);
            return response.status(500).json("Database Error 2 ");
        });
      //  console.log("Registration Successful...");
        return response.status(200).json({ message : "success"});
    }
    else {
        //console.log("Already registered for this event ");
        return response.status(500).json({ message : 'You are already registered for this event '});
    }
} );

app.post('/email-sent', (req, res) => {
    const { email, category, event } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
        auth: {
            user: 'rgukteventmanagement2024@gmail.com',  //'rr200002@rguktrkv.ac.in', // replace with your email
            pass: 'yzoq fquu cwag zvtu'//'lfqj emox zijs umfu'   // replace with your email password or app-specific password
        }
    });

    let mailOptions = {
        from: 'rgukteventmanagement2024@gmail.com', // sender address
        to: email,                      // list of receivers
        subject: 'Welcome to RGUKT Event Mangement',             // Subject line
        text: '',                  // plain text body
        html : `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Registration Confirmation</title>
            <!-- Bootstrap CSS -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f5f5f5;
                    padding: 0;
                    margin: 0;
                }
                .container {
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    margin-top: 20px;
                }
                .message {
                    font-size: 1.5em;
                    font-family: 'Caveat', cursive;
                }
                .closing {
                    color: dimgrey;
                    font-family: 'Roboto', sans-serif;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .contact-info {
                    font-family: 'Roboto', sans-serif;
                }
                @media (max-width: 576px) {
                    .message {
                        font-size: 1.2em;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="row">
                    <div class="col-12 text-left mb-4">
                        <p>Hello,</p>
                        <div class="message">
                            You have successfully registered for the event ${event}.<br>
                            <p>All the best</p>
                        </div>
                    </div>
                    <div class="col-12 text-left closing">
                        Best Regards,<br>
                        From Hackathon Hunters
                    </div>
                    <div class="col-12 contact-info text-right">
                        <p>For queries contact below Co-ordinators,</p>
                        <p>Culturals-6300520145</p>
                        <p>Technical-6300097818</p>
                        <p>SRC-7671003179</p>
                        <p>Sports-9392223188</p>
                    </div>
                </div>
            </div>
            <!-- Optional: Bootstrap JS and dependencies -->
            <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        </body>
        </html>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send email.' });
        }
        //console.log('Email sent: ' + info.response);
        //console.log('Message sent: %s', info.messageId);
    });
    return res.status(200).json({ message : "success"});
});

app.post('/admin-access/', async (request, response)=>{
    const {email, password} = request.body ;
    const query = `
    SELECT * FROM admin
    WHERE email='${email}';
    `;
    const admin = await db.get(query);
    if( password==admin.password ){
        return response.status(200).json({message : 'success'});
    }
    else {
        return response.status(500).json({message : 'Failed to login'});
    }
});

app.post('/orgainzerAdd/', async (request, response)=>{
    const {organizerEmail} = request.body ;
    const getquery = `
        SELECT * FROM student
        WHERE email = '${organizerEmail}';
    `;
    const getstudent = await db.get(getquery);
    if(getstudent===undefined){
        return response.status(500).json({message : 'Need to first register as Student '});
    }
    const getquery2 = `
        SELECT * FROM organiser 
        WHERE email ='${organizerEmail}';
    `;
    const getorganizer = await db.get(getquery2);
    if(getorganizer===undefined){
        const getquery3 = `
            INSERT INTO organiser (email, password)
            VALUES ('${organizerEmail}', '${getstudent.password}');
        `;
        db.run(getquery3, function(err){
            if(err){
                //console.log('Error in inserting into orgainzer');
                return response.status(500).json({message : 'Error in adding as Organizer'});
            }
        });
        return response.status(200).json({message : 'success'});
    }
    else {
        return response.status(500).json({message: 'Already a member of event organizer'});
    }
});

app.post('/orgainzerRemove/', (request, response)=>{
    const {organizerEmail} = request.body ;
    const getquery = `
        DELETE FROM organiser 
        WHERE email = '${organizerEmail}';
    `;
    db.run(getquery, function(err){
        if(err){
            //console.log("Removed as organiser");
            return response.status(500).json({message : 'Failed to Remove'});
        }
    });
    return response.status(200).json({message : 'success'});
});

app.post('/details/',async (request, response)=>{
    const {registrations, students, organizers} = request.body ;
    const regRes = await db.get('select count(*) from registration ;') ;
    //console.log(regRes);
    const stuRes = await db.get('select count(*) from student ;');
    //console.log(stuRes);
    const orgRes = await db.get('select count(*) from organiser');
    //console.log(orgRes);
    response.status(200).json({message:'success', registrations : regRes, students: stuRes, organizers:orgRes });
});

app.get('/bar-chart/', async (request, response)=>{
    const culturals = await db.get("select count(*) from registration where category_name='Culturals';");
    const src = await db.get("select count(*) from registration where category_name='src';")
    const technical = await db.get("select count(*) from registration where category_name='technical';")
    const sports = await db.get("select count(*) from registration where category_name='sports';")
    //console.log(culturals, src , technical, sports) ;
    return response.status(200).json({culturals : culturals, src : src , technical : technical , sports : sports });
});

app.get('/area-chart/', async (request, response)=>{
    const query = `select date, count(*) as count from registration group by date order by date desc limit 6; `;
    const res = await db.all(query); //It gets a list of values of json objects 
    /* console.log(res);
    console.log(res[0]);
    console.log(res[5]);
    console.log(res[0].date);
    console.log(res[2].date - '1');
    */
    return response.status(200).json({one : res[0], two : res[1], three : res[2], four  : res[3], five :  res[4], six  : res[5] });
});

app.post('/email-organizer/', (request, response)=>{
        const { emailid , text } = request.body;
    
        let transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
            auth: {
                user: 'rgukteventmanagement2024@gmail.com',  //'rr200002@rguktrkv.ac.in', // replace with your email
                pass: 'yzoq fquu cwag zvtu'//'lfqj emox zijs umfu'   // replace with your email password or app-specific password
            }
        });
        
        if(text=='add'){
            var mes = 'We are pleased to inform you that you have been granted access to the role of Event Organizer for our upcoming event. Congratulations on this new responsibility! ';
        }else {
            var mes = `You are no longer as a Event Organiser \n Consult admin "rgukteventmanagement2024@gmail.com" for more details`;
        }

        let mailOptions = {
            from: 'rgukteventmanagement2024@gmail.com', // sender address
            to: emailid,                      // list of receivers
            subject: 'Welcome to RGUKT Event Mangement',             // Subject line
            text: mes,                  // plain text body
            html : `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f5f5f5;
            padding: 0;
            margin: 0;
        }
        .container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-top: 20px;
        }
        .message {
            font-size: 1.5em;
            font-family: 'Caveat', cursive;
        }
        .closing {
            color: dimgrey;
            font-family: 'Roboto', sans-serif;
            font-weight: bold;
            margin: 10px 0;
        }
        .contact-info {
            font-family: 'Roboto', sans-serif;
        }
        @media (max-width: 576px) {
            .message {
                font-size: 1.2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12 text-left mb-4">
                <p>Hello,</p>
                <div class="message">
                    ${mes}
                </div>
            </div>
            <div class="col-12 text-left closing">
                Best Regards,<br>
                From Hackathon Hunters
            </div>
            <div class="col-12 contact-info text-right">
                <p>For queries contact below Co-ordinators,</p>
                <p>Culturals-6300520145</p>
                <p>Technical-6300097818</p>
                <p>SRC-7671003179</p>
                <p>Sports-9392223188</p>
            </div>
        </div>
    </div>
    <!-- Optional: Bootstrap JS and dependencies -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
            `
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return 
            }
            //console.log('Email sent: ' + info.response);
            //console.log("Email sent to event organiser");
            //console.log('Message sent: %s', info.messageId);
        });
        return 
});

