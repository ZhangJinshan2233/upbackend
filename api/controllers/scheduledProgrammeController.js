const schProgrammeService=require('../service/scheduledProgramme')();
const safeAwait=require('safe-await');
module.exports=()=>{
    const schProgrammeController={};
    schProgrammeController.createScheduledProgramme=async(req,res)=>{
      const [err,scheduledProgramme] =await safeAwait(schProgrammeService.createScheduledProgramme(req.body));
      if(err) throw err;
      res.status(200).json(
          scheduledProgramme
      )
    }
    return schProgrammeController
}