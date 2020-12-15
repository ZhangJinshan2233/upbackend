const {noteService}=require('../service')
const Controller = require('./Controller')
class NoteController extends Controller {
    constructor(service) {
        super(service)
        this.service = service
    }
}

const noteController=new NoteController(noteService)
module.exports=noteController