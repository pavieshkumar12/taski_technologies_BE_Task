import express from 'express'
const router = express.Router()
import author from './authorRoute.js';
import book from './bookRoute.js';

router.use('/api',author);
router.use('/api',book);
export default router