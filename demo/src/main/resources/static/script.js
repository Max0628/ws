// 初始化 WebSocket 和 STOMP 連接
let stompClient = null;
let sender = '';
let receiver = '';

// 輸入使用者名稱並連接 WebSocket
function connect() {
    sender = document.getElementById('username').value.trim();
    if (!sender) return alert('Please enter your name!');

    // 在连接时传递用户名作为查询参数
    const socket = new SockJS('/ws?username=' + encodeURIComponent(sender));
    stompClient = Stomp.over(socket);
    stompClient.heartbeat.outgoing = 10000; // 每 10 秒發送心跳
    stompClient.heartbeat.incoming = 10000;
    stompClient.connect({}, onConnected, onError);
}

// 當連接成功後顯示聊天界面
function onConnected() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat-room').style.display = 'block';

    // B 客戶端自動訂閱來自伺服器的通知
    stompClient.subscribe('/user/queue/subscribe', function(message) {
        const notification = JSON.parse(message.body);
        const privateChatRoom = notification.privateChatRoom;
        const senderName = notification.sender;

        // 设置接收者为发起聊天的用户
        receiver = senderName;

        // 订阅私人聊天频道
        stompClient.subscribe(privateChatRoom, onMessageReceived);
    });
}

// 處理連接錯誤
function onError(error) {
    console.error('Error connecting to WebSocket:', error);
}

// 設定接收者，並通知伺服器建立與接收者的私訊
function setReceiver(selectedReceiver) {
    receiver = selectedReceiver;

    // 通知伺服器建立私聊頻道
    stompClient.send("/app/triggerSubscription", {}, JSON.stringify({
        sender: sender,
        receiver: receiver
    }));

    // 訂閱私人頻道（由 A 進行）
    const privateChatRoom = '/queue/private/' +
        (sender < receiver ? sender + '-' + receiver : receiver + '-' + sender);
    stompClient.subscribe(privateChatRoom, onMessageReceived);
}

// 當收到訊息時，顯示訊息
function onMessageReceived(message) {
    const messageBody = JSON.parse(message.body);
    const messageElement = document.createElement('div');
    messageElement.textContent = `${messageBody.sender}: ${messageBody.content}`;
    document.getElementById('messages').appendChild(messageElement);
}

// 發送訊息
function sendMessage() {
    const messageContent = document.getElementById('message-input').value;
    if (messageContent && stompClient && receiver) {
        const chatMessage = {
            sender: sender,
            receiver: receiver,
            content: messageContent
        };
        stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
        document.getElementById('message-input').value = '';
    }
}
