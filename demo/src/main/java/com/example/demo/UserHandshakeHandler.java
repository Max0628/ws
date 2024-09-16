package com.example.demo;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        String username = (String) attributes.get("username");
        if (username == null) {
            // 可以抛出异常或者给定一个默认值
            throw new IllegalArgumentException("Username not found in handshake attributes");
        }
        return new StompPrincipal(username);
    }
}