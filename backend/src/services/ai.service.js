const {GoogleGenAI} = require("@google/genai");

const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_GENAI_API_KEY
});


async function invokeGeminiAi(){
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents: "Explain how AI works in a few words",
    })
    
    console.log(response.text);
}
module.exports={
    invokeGeminiAi
}