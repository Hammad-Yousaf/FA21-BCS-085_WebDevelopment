const mongoose=require('mongoose');
const express =require('express');

const func = async () => {

    let dbname = "hommod"
    let something = await mongoose.connect('mongodb://atlas-sql-663da879b9468d378e18f945-t5q8j.a.query.mongodb.net/wheelscape?ssl=true&authSource=admin').then(

        () => {


            console.log("Host Name:", mongoose.connection.host);
            // console.log("you have successfully connected to the database",something.connection)
        }


    ).catch(
        () => {

            console.log("error");

        }


    )

}

module.exports=func;