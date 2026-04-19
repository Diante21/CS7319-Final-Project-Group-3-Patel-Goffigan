package com.layered.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendLayeredApplication {

	public static void main(String[] args) {
		// Load .env before Spring starts so @Value placeholders resolve correctly.
		Dotenv dotenv = Dotenv.configure()
				.directory("src/main")
				.ignoreIfMissing()
				.load();
		dotenv.entries().forEach(entry ->
				System.setProperty(entry.getKey(), entry.getValue())
		);

		SpringApplication.run(BackendLayeredApplication.class, args);
	}

}
