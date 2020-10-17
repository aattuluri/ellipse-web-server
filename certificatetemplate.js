// const cer = require('./certificatebackground.png');
module.exports = (title,organizer_name,participant_name,date,event_name,share_id,college_name) => {
    const today = new Date();
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
    <style>
        
        .bgimage {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .one {
            /* position: absolute;
            left:109px;
            top:105px; */
            font-weight: bolder;
            /* margin: 0px; */
            font-size: 90px;
        }
        .two {
            /* position: absolute;
            left:109px;
            top:281px; */
            /* font-weight: bolder; */
            font-size: 39px;
            margin: 0px;
            margin-top: 68px;
        }
        .three {
            /* position: absolute;
            left: 109px;
            top: 326px; */
            font-weight: bolder;
            font-size: 65px;
            margin: 0px;
            margin-top: 0px;
        }
        .four {
            /* position: absolute;
            left: 109px;
            top: 420px; */
            /* font-weight: bolder; */
            font-size: 50px;
            margin: 0px;
            margin-top: 17px;
        }
        .five {
            /* position: absolute;
            left: 109px;
            top: 496px; */
            font-weight: bolder;
            font-size: 65px;
            margin: 0px;
            margin-top: 17px;
        }
        .six {
            /* position: absolute;
            left: 109px;
            top: 590px; */
            font-size: 50px;
            margin: 0px;
            margin-top: 17px;
        }
        .seven {
            /* position: absolute;
            left: 109px;
            top: 897px; */
            font-weight: bolder;
            font-size: 2.5em;
            /* margin: auto+100px; */
            /* margin: 0px; */
            /* margin-top: 2000px+auto; */
        }
        .eight {
            /* position: absolute; */
            /* left: 1404px;
            top: 1035px; */
            /* font-weight: bolder; */
            font-size: 18px;
            margin: 0px;
        }
        .nine {
            /* position: absolute;
            right: 96px;
            top: 1077px; */
            /* font-weight: bolder; */
            font-size: 18px;
            margin: 0px;
        }
        .mainDiv {
            position: absolute;
            left:109px;
            top:90px;
            width: 1300px;
        }
        .bottomDiv {
            position: absolute;
            left: 1400px;
            top: 1000px;
        }
        .organizerDiv {
            position: absolute;
            left: 109px;
            top: 940px;
            /* bottom: 20px; */
        }
        
    </style>
</head>
<body>
<img class="bgimage" src="http://localhost:4000/files/certificatebackground.png" height="1180px" width="1950px">
<div class="mainDiv">
    <p class="one">${title}</p> 
    <p class="two">${date}</p>
    <p class="three">${participant_name}</p>
    <p class="four">has participated in</p>
    <p class="five">${event_name}</p>
    <p class="six">an hackathon organized by ${organizer_name}<br>
        hosted on <a style="text-decoration:none;color: #000000" href="https://ellipseapp.com">ellipseapp.com</a></p>
    
</div>
<div class="organizerDiv">
    <p class="seven">${organizer_name}<br>Organizer<br>${college_name}</p>
</div>
<div class="bottomDiv">
    <p class="eight">Verify at <a style="text-decoration:none;color: #000000" href="https://ellipseapp.com/verify_certificate/${share_id}">ellipseapp.com/verify_certificate/${share_id}</a></p>
    <p class="nine">${organizer_name} has confirmed the participation of<br>
        individual in the event</p>
</div>
</body>
</html>
    `;
};


// http://localhost:4000/files/certificatebackground.png