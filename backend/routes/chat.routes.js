const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/conversations', ctrl.getConversations);
router.get('/messages/:userId', ctrl.getMessages);
router.delete('/messages/:messageId', ctrl.deleteMessage);

module.exports = router;
