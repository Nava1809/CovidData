const express=require("express");
// const connectdb=require("./config/db")
const dotenv=require("dotenv")
const path=require("path")
const covidData=require("./model/covidData")
const bodyParser = require("body-parser");
const connectdb = require("./config/db");
dotenv.config();
connectdb();

const PORT=process.env.PORT || 8080

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(bodyParser.json())


app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.get("/totalRecovered",(req,res)=>{
    const user=covidData.aggregate([ { 
		$project: { 
			totalcases: "$recovered"
		} 
	},
	{
	$group: {
		_id : "total",
		recovered : {$sum: "$totalcases"}
	}
	}
	] ).exec((err,users)=>{
        if(err){
            res.send(err)
        }
        
        body = {"data" : users}
        res.send(body)
    })
})

app.get("/totalActive",(req,res)=>{
    const user=covidData.aggregate([ { 
		$project: { 
			totalcases: { $subtract: [ "$infected", "$recovered" ] }
		} 
	},
	{
	$group: {
		_id : "total",
		totalcases : {$sum: "$totalcases"}
	}
	}
	] ).exec((err,users)=>{
        if(err){
            res.send(err)
        }
        
        body = {"data" : users}
        res.send(body)
    })
	
})


app.get("/totalDeath",(req,res)=>{
    const user=covidData.aggregate([ { 
		$project: { 
			totalcases: "$deaths"
		} 
	},
	{
	$group: {
		_id : "total",
		death : {$sum: "$totalcases"}
	}
	}
	]).exec((err,users)=>{
        if(err){
        res.send(err)
        
    }
    
    body = {"data" : users}
    res.send(body)

    })

})


app.get("/hotspotStates",(req,res)=>{
    const user=covidData.aggregate([
        { 
          $project: { 
            infected: 1,
            state: 1,
            totalcases: { $subtract: [ "$infected", "$recovered" ] }
          } 
        },
        {
          $project: {	
            state: 1,
            rate: { $divide: [ "$totalcases", "$infected" ] },
            _id : 0
          }
        },
        {
          $project: {	
            state: 1,
            rate: { $round: [ "$rate", 5] },
            _id : 0
          }
        },
        {
          $match: {	
            rate: { "$gt": 0.1 }
          }
        }
      ]).exec((err,users)=>{
        if(err){
            res.send(err)
        }
        
        body = {"data" : users}
        res.send(body)
      })
})

app.get("/healthyStates",(req,res)=>{
    const user=covidData.aggregate([
        {
          $project: {	
            state: 1,
            mortality : { $divide: [ "$deaths", "$infected" ] },
            _id : 0
          }
        },
        {
          $project: {	
            state: 1,
            mortality: { $round: [ "$mortality", 5] },
            _id : 0
          }
        },
        {
          $match: {	
            mortality: { "$lt": 0.005 }
          }
        }
      ]).exec((err,users)=>{
        if(err){
            res.send(err)
        }
        body = {"data" : users}
        res.send(body)
      })
})

app.post("/postCoviddata",async(req,res)=>{
    try{
    const user=await covidData.create(req.body)
        res.status(201).json({
            status:"success",
            user
        })
     }catch{
         res.status(500).json({
        status:"failed"
     })
    }
})

app.listen(PORT,()=>{console.log(`server is running at port ${PORT}`)})