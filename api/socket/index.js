const notification = require('../notification');
const {
	unreadNotificationController
} = require('../controllers')
module.exports = (io) => {

	io.of('/chat')
		.on('connection', socket => {
			let userId= fetchUserId(socket)
			socket.on('enter chatRoom', (chatRoom) => {
				socket.join(chatRoom);
				console.log('join ' + chatRoom);
			});

			socket.on('leave chatRoom', (chatRoom) => {
				socket.leave(chatRoom);
				console.log('left ' + chatRoom);
			});

			// When a socket exits
			socket.on('disconnect', () => {
				// Find the room, to which the socket is connected to and purge the user
				console.log('one user disconnected')
			});

			// When a new message arrives
			socket.on('new message', (messageInfo) => {
				let {
					content,
					author,
					name,
					isImage,
					createAt,
					recipientId,
					chatRoomId,
					authorModel,
				} = messageInfo

				io.of('/chat')
					.in(chatRoomId)
					.clients(function (err, clients) {
						let recipientModel = 'Coach'
						if (authorModel === "Coach") {
							recipientModel = "Coachee"
						}
						if (err) throw err;
						if (clients.length < 2) {

							if (isImage) {
								notification.sendGeneralNotification(name, recipientId, "Image message")
							}
							notification.sendGeneralNotification(name, recipientId, content)
							unreadNotificationController.create_unread_notification('message', author, authorModel, recipientId, recipientModel)
						}
					})
				socket
					.to(messageInfo.chatRoomId)
					.emit('refresh message', {
						content,
						isImage,
						author,
						name,
						createAt
					});
			});

		});


}