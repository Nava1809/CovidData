const mongoose =require("mongoose");
const covidDataSchema=mongoose.Schema({
    state:{
        type:String,
        required:true
    },
    infected:{
        type:Number,
        required:true
    },
    recovered:{
        type:Number,
        required:true
    },
    deaths:{
        type:Number,
        required:true
    }
})
module.exports=coviddata=mongoose.model("covidData",covidDataSchema);