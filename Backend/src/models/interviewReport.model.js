const mongoose = require("mongoose");


/**
 * job description schema
 * resume text
 * self description
 * score 
 * technical questions
 * [{question:"",
 * intenshion :"",
 * answer :""
 *        }]
 * behavioral questions[]
 * skill gap analysis[]
 * preparation plan[{
 * DAY:number
 * focus:string
 * task[]
 * 
 * }]
 */

const technicalQuestions =mongoose.Schema({
    question:{
        type:String,
        required:[
            true,"Technical questions is required"
        ]
            },
            intention:{
                type:String,
                required:[
                    true,'Intention is required'
                ]
            },
             answer:{
                type:String,
                required:[
                    true,'answer is required'
                ]
            },
            
},{
    _id:false
})
const behavioralQuestions =mongoose.Schema({
    question:{
        type:String,
        required:[
            true,"Behavioral questions is required"
        ]
            },
            intention:{
                type:String,
                required:[
                    true,'Intention is required'
                ]
            },
                answer:{
                type:String,
                required:[
                    true,'answer is required'
                ]
            },
},{
    _id:false
})
const skillGapAnalysis =mongoose.Schema({
    skill:{
        type:String,
        required:[
            true,"Skill is required"
        ]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[
            true,"Severity is required"
        ]
    }
},{
    _id:false
})
const preparationPlan =mongoose.Schema({
    day:{
        type:String,
        required:[
            true,"Day is required"
        ]
    },
    focus:{
        type:String,
        required:[
            true,"Focus is required"
        ]
    },
    tasks:[{
        type:String,
        required:[
            true,"Task is required"
        ]
    }]
},{
    _id:false
})

const interviewSchema =mongoose.Schema({
    jobDescription:{
        type:String,
        required:[
            true,"Job description is required"
        ]
    },
    resume:{
        type:String
    },
    selfDescription:{
        type:String
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
         },
    technicalQuestions:[technicalQuestions],
    behavioralQuestions:[behavioralQuestions],
    skillGapAnalysis:[skillGapAnalysis],
    preparationPlan:[preparationPlan],

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    title:{
        type:String,
        required:[
            true,"Title is required"
        ]
    }
}
,{timestamps:true
})


const InterviewReport = mongoose.model("InterviewReport",interviewSchema)

module.exports = InterviewReport
