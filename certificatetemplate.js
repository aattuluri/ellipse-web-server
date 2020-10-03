// const cer = require('./certificatebackground.png');
module.exports = () => {
    const today = new Date();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
    <style>
        body {
            
        }
        .title {
            position: absolute;
            left:80px;
            top:100px;
        }
        .title2 {
            position: absolute;
            left:80px;
            bottom:100px;
        }
        .bgimage {
            display: block;
            margin-left: auto;
            margin-right: auto;
            marign-top: auto;
            margin-bottom: auto;
        }
        .one {
            position: absolute;
            left:80px;
            top:60px;
            font-weight: bolder;
            font-size: 2.5em;
        }
        .two {
            position: absolute;
            left:80px;
            top:170px;
            /* font-weight: bolder; */
            /* font-size: 2.5em; */
        }
        .three {
            position: absolute;
            left: 80px;
            top: 200px;
            font-weight: bolder;
            font-size: 2.5em;
        }
        .four {
            position: absolute;
            left: 80px;
            top: 270px;
            /* font-weight: bolder; */
            font-size: 1.5em;
        }
        .five {
            position: absolute;
            left: 80px;
            top: 300px;
            font-weight: bolder;
            font-size: 2.5em;
        }
    </style>
</head>
<body>
<img class="bgimage" src="http://localhost:4000/files/certificatebackground.png" height="1480px" width="1950px">
<p class="one">CodeChef VIT</p> 
<p class="two">01/10/2020</p>
<p class="three">PUNEPALLE R LALITH SAGAR</p>
<p class="four">has participated in</p>
<p class="five">DevHack</p>
</body>
</html>
    `;
};