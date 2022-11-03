const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js")
// console.log(date())
const mongoose = require("mongoose")
const _ = require("lodash")


const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://punam-k:test456@cluster0.fvxiezu.mongodb.net/todolistDB",{useNewUrlParser:true})

const itemsSchema = {
    name:String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name:"Welcome to your to do list."
})

const item2 = new Item({
    name:"Hit the + button to add more items"
})

const item3 = new Item({
    name:"<-- hit this to delete an item."
})

const defaultItems = [item1, item2, item3]

// Item.insertMany(defaultItems, function(err){
//     if(err){
//         console.log(err)
//     }else{
//         console.log("Successfully saved all the default items.")
//     }
// })
const listSchema = {
    name:String,
    items:[itemsSchema]
}
const List = mongoose.model("List", listSchema)

app.get("/", function(req, res){
    // let day = date.getDate()
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Successfully saved all the items.")
                }
            })
            res.redirect("/")
        }else{
            res.render("list" ,{listTitle: "Today", addNewItems:foundItems});

        }
        
        
    })

    

})



app.get('/:customListName', function(req, res){
    const customListName = _.capitalize(req.params.customListName)
    List.findOne({name:customListName}, function(err, foundlist){
        if(!err){
            if(!foundlist){
                //create new list
                // console.log("doesn't exist")
                const list = new List({
                    name:customListName,
                    items:defaultItems
                })
                
                list.save()
                res.redirect("/"+ customListName)

            }else{
                // console.log("exists")
                res.render("list" ,{listTitle: foundlist.name, addNewItems:foundlist.items});
                
            }
        }
        
    })
   
})


app.post("/", function(req, res){

    // console.log(req.body)
    const itemName = req.body.addItem 
    const listName = req.body.list

    const item = new Item({
        name:itemName
    })
    if (listName === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName}, function(err, foundlist){
            foundlist.items.push(item)
            foundlist.save()
            res.redirect("/"+ listName)
        })
    }
    

    // if (req.body.list === "Work"){
    //     workItems.push(item)
    //     res.redirect("/work")
    // }else{
    //     // items.pop()
    //     items.push(item)
    //     res.redirect("/")
    // }
    
})

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully deleted checked item.")
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err, foundlist){
            if(!err){
                res.redirect("/"+ listName)
            }
        })
    }

    // Item.findByIdAndRemove(checkedItemId, function(err){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         console.log("Successfully deleted the data.")
    //     }
    // })
    // res.redirect("/")
})

// app.get("/work", function(req, res){
//     res.render("list",{listTitle: "Work List", addNewItems: workItems})
// })



app.get("/about", function(req, res){
    res.render("about")
})


// app.post("/work", function(req, res){
//     let item = req.body.addItems 
//     workItems.push(item)
//     res.redirect("/work")
// })

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function(){
    console.log("Server is getting started")
})