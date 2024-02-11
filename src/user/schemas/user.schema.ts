import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class User {

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    id: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ unique: true })
    phoneNo: string;

    @Prop({ required: true })
    company: string;

    @Prop()
    jobRole: string;

    @Prop()
    location: string;
}

export const UserCollectionName = 'Users';
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & mongoose.Document;