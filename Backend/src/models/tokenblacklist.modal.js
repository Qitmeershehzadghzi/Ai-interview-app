import mongoose from "mongoose"

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required to be added to blacklist"]
    }
    },{timestamps:true}
)
const tokenBlacklistModel = mongoose.model('tokenblacklist',tokenBlacklistSchema)
export default tokenBlacklistModel