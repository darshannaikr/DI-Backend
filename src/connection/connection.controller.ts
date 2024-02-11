import { Controller, Get } from '@nestjs/common';

@Controller('connection')
export class ConnectionController {

    @Get('practice')
    async practice(){
        console.log("practice here....");
        let a = "3.9";
        let b = "2.8";
        console.log(+a + +b);
        
    }
}
