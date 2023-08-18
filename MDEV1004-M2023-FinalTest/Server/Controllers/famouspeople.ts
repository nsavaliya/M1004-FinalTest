import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../Models/user';
import Famouspeople from '../Models/famouspeople';
import mongoose from 'mongoose';

import { GenerateToken } from '../Util/index';

// Utility Function
function SanitizeArray(unsanitizedValue: string | string[]): string[] {
    if (Array.isArray(unsanitizedValue)) {
        return unsanitizedValue.map((value) => value.trim());
    } else if (typeof unsanitizedValue === "string") {
        return unsanitizedValue.split(",").map((value) => value.trim());
    } else {
        return [];
    }
}

/* Authentication functions */
export function ProcessRegistration(req: Request, res: Response, next: NextFunction): void {
    // instantiate a new user object
    let newUser = new User
        ({
            username: req.body.username,
            emailAddress: req.body.EmailAddress,
            displayName: req.body.FirstName + " " + req.body.LastName
        });

    User.register(newUser, req.body.password, (err) => {
        if (err instanceof mongoose.Error.VersionError) {
            console.error("ERROR: All fields are required.");
            res.status(400).json({ success: false, msg: "ERROR: User not registered. All fields are required." });
        }

        if (err) {
            console.error('Error: Inserting New User');
            if (err.name == "UserExistsError") {
                console.error('Error: User Already Exists');
            }
            return res.json({ success: false, msg: 'ERROR: User not Registered Successfully!' })
        }
        // if we had a front-end (Angular, React or a Mobile UI)...
        return res.json({ success: true, msg: 'User Registered Successfully!' });
    });
}

export function ProcessLogin(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        // are there server errors?
        if (err) {
            console.error(err);
            return next(err);
        }
        // are the login errors?
        if (!user) {
            return res.json({ success: false, msg: 'ERROR: User Not Logged in Successfully!' });
        }
        req.logIn(user, (err) => {
            // are there db errors?
            if (err) {
                console.error(err);
                res.end(err);
            }
            const authToken = GenerateToken(user);

            return res.json({
                success: true, msg: 'User Logged In Successfully!', user: {
                    id: user._id,
                    displayName: user.displayName,
                    username: user.username,
                    emailAddress: user.emailAddress
                }, token: authToken
            });
        });
    })(req, res, next);
}

export function ProcessLogout(req: Request, res: Response, next: NextFunction): void {
    req.logout(() => {
        console.log("User Logged Out");

    });
    // if we had a front-end (Angular, React or Mobile UI)...
    res.json({ success: true, msg: 'User Logged out Successfully!' });
}




/* API Functions */
export function DisplayFamouspeopleList(req: Request, res: Response, next: NextFunction): void {

    Famouspeople.find({})
        .then(function (data) {
            res.status(200).json({ success: true, msg: "Famouspeople list displayed successfully.", data: data });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
        });

}

export function DisplayFamouspeopleByID(req: Request, res: Response, next: NextFunction): void {
    try {
        let id = req.params.id;
        Famouspeople.findById({ _id: id })
            .then(function (data) {
                if (data) {
                    res.status(200).json({ success: true, msg: "Famouspeople retrived by ID successfully.", data: data });
                }
                else {
                    res.status(404).json({ success: false, msg: "ERROR: Famouspeople ID not found.", data: null });
                }
            })
            .catch(function (err) {
                console.error(err);
                res.status(400).json({ success: false, msg: "ERROR: Famouspeople ID not formatted correctly.", data: null });
            });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
    }
}

export function AddFamouspeople(req: Request, res: Response, next: NextFunction): void {
    try {

       
        let achievements = SanitizeArray(req.body.achievements as string);

        let famouspeople = new Famouspeople({
            famouspeopleID: req.body.famouspeopleID,
            name: req.body.name,
            occupation: req.body.occupation,
            nationality: req.body.nationality,
            birthDate: req.body.birthDate,
            birthPlace: req.body.birthPlace,
            bio: req.body.bio,
            achievements: achievements,
            imageURL: req.body.imageURL
        });
        Famouspeople.create(famouspeople)
            .then(function (data) {
                res.status(200).json({ success: true, msg: "Famouspeople added successfully.", data: famouspeople });
            })
            .catch(function (err) {
                console.error(err);
                if (err instanceof mongoose.Error.VersionError) {
                    res.status(400).json({ success: false, msg: "ERROR: Famouspeople not added. All fields are required.", data: null });
                }
                else {
                    res.status(400).json({ success: false, msg: "ERROR: Famouspeople not added.", data: null });
                }
            });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
    }
}

export function UpdateFamouspeople(req: Request, res: Response, next: NextFunction): void {
    try {
        let id = req.params.id;

        
        let achievements = SanitizeArray(req.body.achievements as string);

        let famouspeopleToUpdate = new Famouspeople({
            _id: id,
            famouspeopleID: req.body.famouspeopleID,
            name: req.body.name,
            occupation: req.body.occupation,
            nationality: req.body.nationality,
            birthDate: req.body.birthDate,
            birthPlace: req.body.birthPlace,
            bio: req.body.bio,
            achievements: achievements,
            imageURL: req.body.imageURL
        });
        Famouspeople.updateOne({ _id: id }, famouspeopleToUpdate)
            .then(function (data) {
                res.status(200).json({ success: true, msg: "Famouspeople updated successfully.", data: famouspeopleToUpdate });
            })
            .catch(function (err) {
                console.error(err);
                if (err instanceof mongoose.Error.VersionError) {
                    res.status(400).json({ success: false, msg: "ERROR: Famouspeople not updated. All fields are required.", data: null });
                }
                else {
                    res.status(400).json({ success: false, msg: "ERROR: Famouspeople not updated.", data: null });
                }
            });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
    }
}

export function DeleteFamouspeople(req: Request, res: Response, next: NextFunction): void {
    try {
        let id = req.params.id;

        Famouspeople.deleteOne({ _id: id })
            .then(function () {
                res.status(200).json({ success: true, msg: "Famouspeople deleted successfully.", data: id });
            })
            .catch(function (err) {
                console.error(err);
                res.status(400).json({ success: false, msg: "ERROR: Famouspeople ID not formatted correctly.", data: null });
            });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
    }
}