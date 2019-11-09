//function DynamicScatter(csvfile,xaxisname,x2axisname,yaxisname,tooltiptitle,title,htmldiv,cwidth,cheight,yaxisTitle,xaxisTitle,x2axisTitle,tm,rm,bm,lm) {
//id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228     
let csvFile ='assets\\data\\data.csv'
//let selCSVVariables =["poverty", "age", "income", "healthcare","healthcareLow","healthcareHigh","obesity","obesityLow","obesityHigh","smokes","smokesLow","smokesHigh"]
let selCSVVariables =["poverty", "age", "income", "healthcare" ,"obesity","smokes" ]
makeCorrelagram(csvFile,selCSVVariables)
DynamicScatter(csvFile,'poverty','obesity','healthcareLow','abbr','abbr','none','#scatter',900,900,"poverty","obesity"," ",50,10,100,50)
