const mongoose =  require("mongoose");




const connectDatabase = ()=>{
    mongoose.connect(process.env.DB,{
        useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(result=>{
        console.log('database connected')
    });
    
}

module.exports = connectDatabase;