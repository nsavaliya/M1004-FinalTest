import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

interface IUser {
    username: string,
    emailAddress: string,
    displayName: string,
    created: Date,
    updated: Date
}

const UserSchema = new Schema<IUser>
    ({
        username: 
        {
            type: String, 
            required: true 
        },
        emailAddress: 
        { 
            type: String, 
            required: true 
        },
        displayName: 
        { 
            type: String, 
            required: true 
        },
        created:
        {
            type: Date,
            default: Date.now()
        },
        updated:
        {
            type: Date,
            default: Date.now()
        }
    },
        {
            collection: 'users'
        });

UserSchema.plugin(passportLocalMongoose);

const Model = mongoose.model<IUser>("User", UserSchema);

declare global {
    export type UserDocument = mongoose.Document &
    {
        _id: String,
        username: String,
        emailAddress: String,
        displayName: String
    }
}
export default Model;