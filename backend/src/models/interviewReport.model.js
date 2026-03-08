const mongoose=require('mongoose');


const technicalQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
});

const behavioralQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Question is required"]
    },
    intention:{ 
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
});

const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is required"]
    },
    severity:{
        type:String,
        enum:["Low","Medium","High"],
        required:[true,"Severity is required"]

    }
},{
    _id:false
});

const preparationPlanSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day is required"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type:String,
        required:[true,"Tasks are required"]
    }]
},{
    _id:false
});
    

const interviewReportSchema=new mongoose.Schema({
    jobDescription:{
        type:String,
        required:true
    },
    resume:{
        type:String,
    },
    selfDescription:{
        type:String,
    },
    matchScore:{
        type:Number,
    },
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionSchema],
    skillGaps:[skillGapSchema],
    preparationPlan:[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    title:{
        type:String,
        required:[true,"Title is required"]
    }
},{
    timestamps:true
})

const interviewReportModel=mongoose.model('InterviewReport',interviewReportSchema);

module.exports=interviewReportModel;