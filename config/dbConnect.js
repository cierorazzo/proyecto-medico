const {default: mongoose} = require("mongoose")
const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongoose conectado exitosamente")
  } catch (error) {
    console.log("Error base de datos")
  }
}

module.exports = dbConnect;