import express from 'express';
let router = express.Router();
import passport from 'passport';

/* Get the Famouspeople Controller */
import { DisplayFamouspeopleList, DisplayFamouspeopleByID, AddFamouspeople, UpdateFamouspeople, DeleteFamouspeople, ProcessRegistration, ProcessLogin, ProcessLogout  } from '../Controllers/famouspeople';

router.get('/list', passport.authenticate('jwt', {session: false}), (req, res, next) => DisplayFamouspeopleList(req, res, next));

router.get('/find/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => DisplayFamouspeopleByID(req, res, next));

router.post('/add', passport.authenticate('jwt', {session: false}), (req, res, next) => AddFamouspeople(req, res, next));

router.put('/update/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => UpdateFamouspeople(req, res, next));

router.delete('/delete/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => DeleteFamouspeople(req, res, next));

// Authentication routes
router.post('/register', (req, res, next) => ProcessRegistration(req, res, next));

router.post('/login', (req, res, next) => ProcessLogin(req, res, next));

router.get('/logout', (req, res, next) => ProcessLogout(req, res, next));

export default router;