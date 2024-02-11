
export class CreateUserDto{
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
    readonly reEnterPassword: string;
    readonly phoneNo: string;
    readonly company: string;
    readonly jobRole: string;
    readonly location: string;
}