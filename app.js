const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { ObjectId } = require('mongodb');
const app = express();
let workItems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pankaj-rawat:Pankajrawat01012001@cluster0.tx2a4pp.mongodb.net/todolistDB",{useNewUrlParser:true});



const itemsSchema = mongoose.Schema({
  name:String
});
const Item = mongoose.model('Item',itemsSchema);
const item1 = new Item({
  name:"Welcome to the ToDoList"
});
const item2 = new Item({
  name:"Add items buy clicking + button"
});
const item3 = new Item({
  name:"<-- Hit this to remove Item"
});




const listSchema = mongoose.Schema({
  name:String,
  listData : [itemsSchema]
});

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
  // JUST TO CHECK IF WEEKEND OR // NOT
  // let day = date.getDate();

  Item.find({},function(err,itemsArray){
    // console.log(itemsArray.length);
    if (itemsArray.length===0){
      Item.insertMany([item1,item2,item3],function(err){
        console.log(err);
      });
    }
    res.render('list', {toDoheading: "Today", newListItem: itemsArray});
  });


});



app.post("/", function(req, res) {
  // res.send("adding to do");
  // console.log(req.body.newItem);
  // console.log(req.body.button);
  item = req.body.newItem;
  // console.log(req.body.button);
  const buttonValue=req.body.button;
  const addItem = new Item({
    name : item
  });
  if (buttonValue==="Today"){
    addItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:buttonValue},function(err,result){
      // console.log(result);
      result.listData.push(addItem);
      result.save();
      res.redirect("/"+buttonValue);
    });
  }


});


app.post("/delete",function(req,res){
  // console.log(req.body.checkbox);
  // console.log(req.body);
  const checkboxID=req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today"){
    Item.findByIdAndRemove(checkboxID,function(err){
      if(!err){
        // console.log("successfully deleted");
      }
    });
    // console.log(checkboxID);
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull :{listData:{_id:checkboxID}}},function(err,result){
      // console.log(result);
    });
    res.redirect("/"+listName);
  }
}
)


app.get("/:customListName", function(req, res) {
  // console.log(req.params.customListName);
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,results){
    // console.log(results);
    if(!err){
      if(!results){
        // console.log("NOT PRESENT");
        const list = new List({
          name:customListName,
          listData : [item1,item2,item3]
        });
        list.save();
        res.redirect("/"+customListName);
        // res.render('list', {toDoheading: customListName, newListItem: results.listData});
      }else{
        // console.log("PRESENT");
          res.render('list', {toDoheading: results.name, newListItem: results.listData});
      }
    }else{
      console.log(err);
    }

  });
});




app.post("/work",function(req,res){
  res.redirect("/work");
});


app.get("/contact",function(req,res){
  res.render("contact",{"toDoheading":"Contact Us"});
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server has successfully started at port 3000");
});
