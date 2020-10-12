import express from 'express'


import games from './games'
import events from './events'


const router = express.Router()


router.get('/health', function (req, res) {
	res.json(require('os').hostname())
})


router.use('/events', events)
router.use('/games', games)


export default router
