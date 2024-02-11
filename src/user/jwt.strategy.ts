import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { user: payload };
  }
}

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<UserDocument>,
//     ) {
//     super({
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         secrete: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload): Promise<any> {
//     const user = await this.userModel.findOne({_id: payload.id });
//     if (!user) {
//       throw new UnauthorizedException('Login first to access this endpoint !');
//     }
//     return user;
//   }
// }