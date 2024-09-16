let stompClient = null;
let sender = '';  // 当前用户自己
let activeReceiver = 'Max';  // 当前聊天的接收者，默认是Max
let chatRooms = {};  // 用于存储每个接收者的聊天记录

document.addEventListener('DOMContentLoaded', function () {
    const users = document.querySelectorAll('.user');
    const chatWith = document.getElementById('chat-with');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // 用户点击登录或直接进入页面时启动 WebSocket 连接
    function connectWebSocket() {
        sender = prompt("Enter your username:").trim();
        if (!sender) return alert('Username is required to connect!');

        const socket = new SockJS('/ws?username=' + encodeURIComponent(sender));
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }

    function onConnected() {
        console.log("Connected as " + sender);

        // 默认订阅全局通知，用于接收私聊通知
        stompClient.subscribe('/user/queue/subscribe', function (message) {
            const notification = JSON.parse(message.body);
            const privateChatRoom = notification.privateChatRoom;
            const senderName = notification.sender;

            // 如果这个房间还没被订阅，则订阅它
            if (!chatRooms[senderName]) {
                chatRooms[senderName] = [];
                subscribeToPrivateChatRoom(senderName, privateChatRoom);
            }
        });
    }

    function onError(error) {
        console.error("WebSocket connection error:", error);
    }

    function subscribeToPrivateChatRoom(receiver, privateChatRoom) {
        stompClient.subscribe(privateChatRoom, function (message) {
            onMessageReceived(receiver, message);
        });
    }

    function onMessageReceived(receiver, message) {
        const messageBody = JSON.parse(message.body);
        const messageElement = document.createElement('div');
        messageElement.textContent = `${messageBody.sender}: ${messageBody.content}`;
        messageElement.classList.add('message');

        if (messageBody.sender === sender) {
            messageElement.classList.add('self');
        }

        // 存储消息到对应聊天记录中
        if (!chatRooms[receiver]) {
            chatRooms[receiver] = [];
        }
        chatRooms[receiver].push(messageBody);

        // 如果是当前聊天的接收者，则显示消息
        if (receiver === activeReceiver) {
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // 点击用户切换聊天对象
    users.forEach(user => {
        user.addEventListener('click', function () {
            users.forEach(u => u.classList.remove('active'));
            user.classList.add('active');

            activeReceiver = user.getAttribute('data-username');
            chatWith.innerText = `Chat with ${activeReceiver}`;

            // 显示当前聊天对象的历史消息
            loadChatHistory(activeReceiver);
        });
    });

    // 加载聊天历史消息
    function loadChatHistory(receiver) {
        chatMessages.innerHTML = '';  // 清空之前的消息
        const messages = chatRooms[receiver] || [];
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${msg.sender}: ${msg.content}`;
            messageElement.classList.add('message');
            if (msg.sender === sender) {
                messageElement.classList.add('self');
            }
            chatMessages.appendChild(messageElement);
        });
    }

    // 发送消息
    sendBtn.addEventListener('click', function () {
        const messageContent = messageInput.value.trim();
        if (messageContent && stompClient && activeReceiver) {
            const chatMessage = {
                sender: sender,
                receiver: activeReceiver,
                content: messageContent
            };

            // 发送消息到服务器
            stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));

            // 显示自己发的消息
            onMessageReceived(sender, { body: JSON.stringify(chatMessage) });
            messageInput.value = '';
        }
    });

    connectWebSocket();
});
