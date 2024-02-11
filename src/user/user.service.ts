import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async registerUser(createUserDto: CreateUserDto) {

        if (createUserDto.password === createUserDto.reEnterPassword) {

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

            const user = {
                ...createUserDto,
                password: hashedPassword,
            }            
            delete user.reEnterPassword;
            const userResponse = await this.userModel.create(user);
            if(userResponse){
                const token = await this.jwtService.sign({ id: userResponse._id, email: userResponse.email, phoneNo: userResponse.phoneNo });
                return { token };
            }
        }else{
            const err = new UnauthorizedException('Both passwords are not matching !');
            return err.getResponse();
        }
    }

    async userLogin(userLoginDto: UserLoginDto) {
        const user = await this.userModel.findOne({ email: userLoginDto.email });

        if (!user) {
            const err = new NotFoundException('User email not found !');
            return err.getResponse();
        }

        const isPasswordMatched = await bcrypt.compare(userLoginDto.password, user.password);
        if (!isPasswordMatched) {
            const err = new UnauthorizedException('Incorrect password !');
            return err.getResponse();
        }

        const token = await this.jwtService.sign({ id: user._id, email: user.email, phoneNo: user.phoneNo });
        const decoded = await this.jwtService.decode(token);
        console.log("decoded ==> ",decoded);
        return { token };
    }

    async getAllUsers(){
        return await this.userModel.find();
    }

    async validateUser(email: string, password: string) {
        const user = await this.userModel.findOne({email: email});
        if (user && user.password === password) {
          const { password, ...result } = user;
          return result;
        }
        return null;
    }
}
