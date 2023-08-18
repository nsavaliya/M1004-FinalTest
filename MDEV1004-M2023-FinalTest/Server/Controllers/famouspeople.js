"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFamouspeople = exports.UpdateFamouspeople = exports.AddFamouspeople = exports.DisplayFamouspeopleByID = exports.DisplayFamouspeopleList = exports.ProcessLogout = exports.ProcessLogin = exports.ProcessRegistration = void 0;
const passport_1 = __importDefault(require("passport"));
const user_1 = __importDefault(require("../Models/user"));
const famouspeople_1 = __importDefault(require("../Models/famouspeople"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../Util/index");
function SanitizeArray(unsanitizedValue) {
    if (Array.isArray(unsanitizedValue)) {
        return unsanitizedValue.map((value) => value.trim());
    }
    else if (typeof unsanitizedValue === "string") {
        return unsanitizedValue.split(",").map((value) => value.trim());
    }
    else {
        return [];
    }
}
function ProcessRegistration(req, res, next) {
    let newUser = new user_1.default({
        username: req.body.username,
        emailAddress: req.body.EmailAddress,
        displayName: req.body.FirstName + " " + req.body.LastName
    });
    user_1.default.register(newUser, req.body.password, (err) => {
        if (err instanceof mongoose_1.default.Error.VersionError) {
            console.error("ERROR: All fields are required.");
            res.status(400).json({ success: false, msg: "ERROR: User not registered. All fields are required." });
        }
        if (err) {
            console.error('Error: Inserting New User');
            if (err.name == "UserExistsError") {
                console.error('Error: User Already Exists');
            }
            return res.json({ success: false, msg: 'ERROR: User not Registered Successfully!' });
        }
        return res.json({ success: true, msg: 'User Registered Successfully!' });
    });
}
exports.ProcessRegistration = ProcessRegistration;
function ProcessLogin(req, res, next) {
    passport_1.default.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (!user) {
            return res.json({ success: false, msg: 'ERROR: User Not Logged in Successfully!' });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                res.end(err);
            }
            const authToken = (0, index_1.GenerateToken)(user);
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
exports.ProcessLogin = ProcessLogin;
function ProcessLogout(req, res, next) {
    req.logout(() => {
        console.log("User Logged Out");
    });
    res.json({ success: true, msg: 'User Logged out Successfully!' });
}
exports.ProcessLogout = ProcessLogout;
function DisplayFamouspeopleList(req, res, next) {
    famouspeople_1.default.find({})
        .then(function (data) {
        res.status(200).json({ success: true, msg: "Famouspeople list displayed successfully.", data: data });
    })
        .catch(function (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "ERROR: Something went wrong.", data: null });
    });
}
exports.DisplayFamouspeopleList = DisplayFamouspeopleList;
function DisplayFamouspeopleByID(req, res, next) {
    try {
        let id = req.params.id;
        famouspeople_1.default.findById({ _id: id })
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
exports.DisplayFamouspeopleByID = DisplayFamouspeopleByID;
function AddFamouspeople(req, res, next) {
    try {
        let achievements = SanitizeArray(req.body.achievements);
        let famouspeople = new famouspeople_1.default({
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
        famouspeople_1.default.create(famouspeople)
            .then(function (data) {
            res.status(200).json({ success: true, msg: "Famouspeople added successfully.", data: famouspeople });
        })
            .catch(function (err) {
            console.error(err);
            if (err instanceof mongoose_1.default.Error.VersionError) {
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
exports.AddFamouspeople = AddFamouspeople;
function UpdateFamouspeople(req, res, next) {
    try {
        let id = req.params.id;
        let achievements = SanitizeArray(req.body.achievements);
        let famouspeopleToUpdate = new famouspeople_1.default({
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
        famouspeople_1.default.updateOne({ _id: id }, famouspeopleToUpdate)
            .then(function (data) {
            res.status(200).json({ success: true, msg: "Famouspeople updated successfully.", data: famouspeopleToUpdate });
        })
            .catch(function (err) {
            console.error(err);
            if (err instanceof mongoose_1.default.Error.VersionError) {
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
exports.UpdateFamouspeople = UpdateFamouspeople;
function DeleteFamouspeople(req, res, next) {
    try {
        let id = req.params.id;
        famouspeople_1.default.deleteOne({ _id: id })
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
exports.DeleteFamouspeople = DeleteFamouspeople;
//# sourceMappingURL=famouspeople.js.map