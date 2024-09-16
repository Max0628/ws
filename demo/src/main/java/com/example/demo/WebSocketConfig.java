package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue", "/topic");//廣播or點對點
        config.setUserDestinationPrefix("/user");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override//註冊STOMP連線端點
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")//註冊"ws" endpoint使瀏覽器可以此端點與後端伺服器websocket連線
                .addInterceptors(new UserHandshakeInterceptor())
                .setHandshakeHandler(new UserHandshakeHandler())
                .withSockJS();//如果瀏覽器不支持websocket,就使用socketJs
    }
}