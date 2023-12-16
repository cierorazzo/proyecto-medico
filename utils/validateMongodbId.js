const mongoose = require("mongoose")
const validateMongoDbId = (id) =>{
  const isValid = mongoose.Types.ObjectId.isValid(id)
  if(!isValid) throw new Error ("Este ID no es valido o no funciona")
}
module.exports=validateMongoDbId