const { validate } = require("../models/UsersModel");

const Ajv = require("ajv").default
const ajv = new Ajv({allErrors: true})
require("ajv-errors")(ajv)
require("ajv-formats")(ajv)

const schema = {

    type : "object" ,
  
    properties : {
  
     
      email : {
  
       type :"string" ,
       format:"email" ,
        errorMessage:"must be valid email " ,
       
      } ,
  
      password : {

          type : "string" ,
         minLength:8 ,
         errorMessage:"should be at least 8 characters"
         } ,

    
        
    } ,
      
    required : [ "email" , "password"] ,
    additionalProperties: false ,
    
  
  } ;

  const vld = ajv.compile(schema) ;
module.exports = vld;