package com.example.demo;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // 處理 A 發起的私訊請求，並通知 B 訂閱私人頻道
    @MessageMapping("/triggerSubscription")
    public void triggerSubscription(@Payload ChatMessage chatMessage) {
        String privateChatRoom = "/queue/private/" +
                (chatMessage.getSender().compareTo(chatMessage.getReceiver()) < 0 ?
                        chatMessage.getSender() + "-" + chatMessage.getReceiver() :
                        chatMessage.getReceiver() + "-" + chatMessage.getSender());

        // 创建一个包含私人频道和发起者的通知对象
        Map<String, String> notification = new HashMap<>();
        notification.put("privateChatRoom", privateChatRoom);
        notification.put("sender", chatMessage.getSender());

        // 通知 B 订阅私人频道，并告知发起者是谁
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiver(),
                "/queue/subscribe",
                notification);
    }

    // 發送消息
    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        String privateChatRoom = "/queue/private/" +
                (chatMessage.getSender().compareTo(chatMessage.getReceiver()) < 0 ?
                        chatMessage.getSender() + "-" + chatMessage.getReceiver() :
                        chatMessage.getReceiver() + "-" + chatMessage.getSender());

        messagingTemplate.convertAndSend(privateChatRoom, chatMessage);
    }
}
