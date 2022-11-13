
const express = require("express");
const request = require("postman-request");
const mongoose = require('mongoose');
const _ = require ('lodash');

mongoose.connect("mongodb+srv://dopamine-admin:Hyper69focus@cluster0.fqblirs.mongodb.net/todolistDB");

//a
const itemsSchema = new mongoose.Schema({
  name: String,
});

//b
const Item = mongoose.model('Item', itemsSchema);

//c
const item1 = new Item({
  name: "Welcome to your To Do List!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.!"
});

const defaultItems = [item1, item2, item3];

//______
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);


//______

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  Item.find({}, (err, i) => { //Item is a collection, similar to array
    if (err) {
      console.log(err)
    } else if (i.length === 0) {
      Item.insertMany(defaultItems, (err) => err ? console.log(err) : console.log('Successfully added default items.'));
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: i
      });
    }
  });

});









// DYNAMIC ROUTES

app.get('/:listId', (req, res) => {

  const listId = _.capitalize(req.params.listId);

  List.findOne({name: listId}, (err, i) => {
    if (!err) {
      if (!i) {
        //Create a new list
        const list = new List({
          name: listId,
          items: defaultItems
        });
        list.save();
        res.redirect('/'+ listId)
} else {
  //Show an existing list
        res.render('list', {
          listTitle: i.name,
          newListItems: i.items})
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save( (err, result) => {
      console.log('Successfully added new item ' + item.name + ' to Today\s ToDoList.');
      res.redirect('/');
    });

  } else {
    List.findOne({name: listName}, (err, i) => {
      if (!err){
        i.items.push(item);
        i.save( (err,result) => {
          res.redirect('/' + listName);
        });
      }
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, err => (err) ? console.log(err) : console.log('Successfully deleted checked item ' + checkedItemId + ' .'));
    res.redirect('/');

  } else {
      List.findOneAndUpdate(
        {name: listName},
        {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => { //$pull: {<fromArray>: {key:value}}} ie listName.items
          if (!err) {
            res.redirect('/' + listName);
          }
        }
      );
  }

});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
