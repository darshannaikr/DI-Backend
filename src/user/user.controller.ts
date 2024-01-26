import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('registerUser')
    async registerUser(@Body() createUserDto: CreateUserDto){
        try {
            return await this.userService.registerUser(createUserDto);
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
}
