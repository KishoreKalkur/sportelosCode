var express = require('express')
const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const url = 'mongodb://localhost:27017';
// Collection Name
const dbName = 'kumudb';
// Create a new MongoClient
const client = new MongoClient(url,{useUnifiedTopology: true});
//source document
const sourceDoc='datas'
//destination document
const destinationDoc='game_summary'
//destinationVariable
var updatedFeedbackDoc;
// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var list=[];
  var res=[];
  const db = client.db(dbName);
  //doc1 and doc2 is retrieveing entire document instead of only feedback values
  doc1 =  db.collection(sourceDoc).find({_id: new ObjectId('5e87460424568112acebb640'),'data.basketEventList.feedbackvalue': {$exists: true}},{"data.basketEventList":1})
  doc2 =  db.collection(sourceDoc).find({_id: new ObjectId('5e8ebd5ba2e7c929449d6552'),'data.basketEventList.feedbackvalue': {$exists: true}},{"data.basketEventList":1})
 
  //iterating over doc1, id and feedback stored in 'list' variable
  doc1.next(function(err, items) {
    if (err) throw err;
    items.data.basketEventList.forEach(element => {
      if (typeof(element.feedbackvalue) !== "undefined" && typeof(element.feedbackvalue) !== null && !isNaN(element.feedbackvalue) )
      { 
        // console.log(element._id+" --->"+element.feedbackvalue)
        list[element._id]=element.feedbackvalue
      }
    });
  });
 
  //iterating over doc2 to take average and store in 'res', updated complete document with new id stored in 
  doc2.next(function(err,items1){
    if (err) throw err;
    updatedFeedbackDoc =items1;
    count=0
    items1.data.basketEventList.forEach(element => {
      if (typeof(element.feedbackvalue) !== "undefined" && typeof(element.feedbackvalue) !== null && !isNaN(element.feedbackvalue) )
      { 
        if(typeof(list[element._id])!='undefined')
          temp=parseInt(element.feedbackvalue)+parseInt(list[element._id])
          res[element._id]=temp/2
          updatedFeedbackDoc.data.basketEventList[count].feedbackvalue = res[element._id]
      }count=count+1;
    });
    // console.log(res);

    //creating doc with new Id
    updatedFeedbackDoc._id = new ObjectId()
    console.log("new document with Id "+updatedFeedbackDoc._id);
    // console.log('output values');
    updatedFeedbackDoc.data.basketEventList.forEach(element => {
    if (typeof(element.feedbackvalue) !== "undefined" && typeof(element.feedbackvalue) !== null && !isNaN(element.feedbackvalue) )
      { 
        console.log(element.feedbackvalue);
      }
    });
    //inserted in same collection, can connect to seperate connection and insert into it
    db.collection('game_summary').insertOne(updatedFeedbackDoc,{ checkKeys: false }
      ,function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      client.close();
    });
    client.close(); 
  });
});
