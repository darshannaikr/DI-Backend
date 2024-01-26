import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async registerUser(createUserDto: CreateUserDto) {
        return await this.userModel.create(createUserDto);
    }

    async userLogin(userLoginDto: UserLoginDto) {
        const user = await this.userModel.findOne({ email: userLoginDto.email });
        console.log("user ==> ", user);
        
        if(!user){
            return "User credentials not found !"
        }else{
            return userLoginDto.password === user.password ? "Login successfull !" : "Incorrect password";
        }
    }
}
