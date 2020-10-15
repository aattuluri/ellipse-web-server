// const cer = require('./certificatebackground.png');
module.exports = (organizer_name,participant_name,date,event_name) => {
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
                marign-top: auto;
                margin-bottom: auto;
            }
            .one {
                position: absolute;
                left:109px;
                top:105px;
                /* font-weight: bolder; */
                font-size: 90px;
            }
            .two {
                position: absolute;
                left:109px;
                top:281px;
                /* font-weight: bolder; */
                font-size: 39px;
            }
            .three {
                position: absolute;
                left: 109px;
                top: 326px;
                font-weight: bolder;
                font-size: 65px;
            }
            .four {
                position: absolute;
                left: 109px;
                top: 420px;
                /* font-weight: bolder; */
                font-size: 50px;
            }
            .five {
                position: absolute;
                left: 109px;
                top: 496px;
                font-weight: bolder;
                font-size: 65px;
            }
            .six {
                position: absolute;
                left: 109px;
                top: 590px;
                font-size: 50px;
            }
            .seven {
                position: absolute;
                left: 109px;
                top: 897px;
                font-weight: bolder;
                font-size: 2.5em;
            }
            .eight {
                position: absolute;
                left: 1404px;
                top: 1035px;
                /* font-weight: bolder; */
                font-size: 25px;
            }
            .nine {
                position: absolute;
                left: 1404px;
                top: 1077px;
                /* font-weight: bolder; */
                font-size: 25px;
            }
            
        </style>
    </head>
    <body>
    <img class="bgimage" src="http://localhost:4000/files/certificatebackground.png" height="1180px" width="1950px">
    <p class="one">${organizer_name}</p> 
    <p class="two">01/10/2020</p>
    <p class="three">${participant_name}</p>
    <p class="four">has participated in</p>
    <p class="five">${event_name}</p>
    <p class="six">an hackathon organized by CodechefVIT<br>
        hosted on ellipseapp.com</p>
    <p class="seven">CodeChef VIT <br>Organizer<br>VIT Univeristy</p>
    <p class="eight">Verify at ellipseapp.com/verify/1234567890</p>
    <p class="nine">CodeChef VIT has confirmed the participation of 
        individual in the even</p>
    </body>
    </html>
    `;
};


// http://localhost:4000/files/certificatebackground.png