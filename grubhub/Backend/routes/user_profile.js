var express = require('express');
var app = express();
var users = require('../models/user');
const crypt = require('../crypt');
var bodyParser = require('body-parser');
var upload = require('../multer');
app.use(bodyParser.json());
const multer = require('multer')
const path = require('path')
const fs = require('fs')
var router = express.Router();
var kafka = require('../kafka/client');

// router.get('/userprofile',function(req,res){
//     console.log("In Get Profile Query");
//     console.log(req.query.email);
//     users.find({email : req.query.email}).then((docs)=>{
//       console.log("In Get Profile Query");
//       if (docs) {
//                   res.writeHead(200, {
//                       'Content-Type': 'text/plain'
//                   })
//                   // console.log(docs);
//                   console.log("Success");
//                   console.log(JSON.stringify(docs[0]));
//                   res.end(JSON.stringify(docs[0]));
                  
//               } else {
//                   res.writeHead(400, {
//                       'Content-Type': 'text/plain'
//                   })
//                   res.end("Unable to get data");
//                   console.log("Unable get data");
//               }
//   });
//   });

router.get('/userprofile',function(req,res){

console.log("Inside get User profile route" + req.session);
    var email = req.query.email;                       
    console.log(email);

    kafka.make_request("buyerprofile", email, function(err,results){
        console.log('Result from Kafka Backend\n', results);
        if (err){
            console.log(" ERROR Occurred");
            res.json({
                status:"error",
                msg:"System Error, Try Again."
            })
        }else{
            console.log("Profile for user " +" sent to client");
            res.writeHead(200,{
                'Content-Type' : 'application/json'
                })
                res.end(JSON.stringify(results[0]));
            }
    });

});
  


  router.post('/userprofile', function (req, res) {
    upload(req, res, err => {
      if (err) {
        res.writeHead(400, {
          'Content-Type': 'text/plain'
        })
        res.end('Issue with uploading')
      } else {
        console.log('Inside upload post call')
        console.log(req.file.originalname)
        // console.log(req.file.email);
        users
          .update(
            { email: req.file.originalname },
            { $set: { image: req.file.filename } }
          )
          .then(response => {
            console.log('response' + response)
            console.log('Updated image.')
            res.writeHead(200, {
              'Content-Type': 'text/plain'
            })
            res.end('Successfully Registered')
          })
          .catch(err => {
            console.log('Error occured while upating data in DB')
            res.writeHead(400, {
              'Content-Type': 'text/plain'
            })
            res.end('Error occured while upating data in DB')
          })
      }
    })
  })


// router.post('/update', function (req, res) {
//     console.log("Inside Update Post Request\n");
//     let data = req.body;
//     console.log(data.email);
//     let password = data.password;
//     crypt.createHash(password, (hash) => {
//         users.findOneAndUpdate({ email: data.email },
//             {
//                 $set: {
//                     first_name: data.first_name,
//                     last_name: data.last_name,
//                     password: hash,
//                     phone: data.phone
//                 }
//             }, { new: true }).then((docs) => {
//                 console.log("In Update Profile Query");
//                 if (!docs) {
//                     res.writeHead(400, {
//                         'Content-Type': 'text/plain'
//                     })
//                     res.end("Unable to get data");
//                     console.log("Unable get data");
//                 } else {
//                     res.writeHead(200, {
//                         'Content-Type': 'text/plain'
//                     })
//                     res.end("Successful");
//                     console.log(password);
//                     console.log("Successful updated");
//                     console.log("Document Updated : ", docs);

//                 }

//             });
//     })
// });

router.post('/update', function (req, res) {
  console.log("Inside Profile Update");
  console.log(req.body);

  kafka.make_request("buyerprofileupdate",req.body,function(err,results){
    if (err){
      console.log( " ERROR Occurred");
      res.json({
          status:"error",
          msg:"System Error, Try Again."
      })
  }else{
    console.log("\nProfile for user sent to client");
    res.writeHead(200,{
        'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(results));
    }
  })

})


router.post('/userimage', function (req, res) {
    console.log('Inside User Image')
    let filename = null
    let binaryData = null
    let base64String = null
  
    users
      .find({
        email: req.body.email
      })
      .then(results => {
        // let query= res[0].image;
        if (
          results[0].image === null ||
          results[0].image === [] ||
          typeof results[0].image === 'undefined'
        ) {
          console.log('No records found!')
        } else {
          console.log(results[0].image)
          console.log(__dirname.split('/routes')[0] + '/public/profile/' + results[0].image);
          binaryData = fs.readFileSync(
            __dirname.split('/routes')[0] + '/public/profile/' + results[0].image
          )
          console.log(binaryData);
          base64String = new Buffer(binaryData).toString('base64')
          console.log('Successfully fetched data from DB')
          console.log(JSON.stringify(results[0]));
          res.writeHead(200, {
            'Content-Type': 'image/png'
          })
          res.end(base64String)
        }
      })
      .catch(err => {
        console.log('Error occured while fetching data from DB.')
        res.writeHead(400, {
          'Content-Type': 'text/plain'
        })
        res.end('Error occured while fetching data from DB')
      })
  })

module.exports = router;