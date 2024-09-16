package com.example.demo;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.security.Principal;

@Data
@RequiredArgsConstructor
public class StompPrincipal implements Principal {
    private final String name;
}