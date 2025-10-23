package com.medac.trello.api;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;

import static com.medac.trello.api.resources.TrelloApi.BASE_API_PATH;

@SpringBootApplication
public class TrelloApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrelloApiApplication.class);
    }

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> webServerFactoryCustomizer() {
        return factory -> factory.setContextPath(BASE_API_PATH);
    }
}


