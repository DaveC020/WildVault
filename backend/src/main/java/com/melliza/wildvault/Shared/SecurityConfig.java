package com.melliza.wildvault.Shared;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/register", "/api/login").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DataSource dataSource(
            @Value("${SPRING_DATASOURCE_URL:}") String springDatasourceUrl,
            @Value("${SPRING_DATASOURCE_USERNAME:}") String springDatasourceUsername,
            @Value("${SPRING_DATASOURCE_PASSWORD:}") String springDatasourcePassword,
            @Value("${SUPABASE_JDBC_URL:}") String supabaseJdbcUrl,
            @Value("${SUPABASE_DB_USER:}") String supabaseDbUser,
            @Value("${SUPABASE_DB_PASSWORD:}") String supabaseDbPassword,
            @Value("${DATABASE_URL:}") String databaseUrl
    ) {
        String jdbcUrl = firstNonBlank(springDatasourceUrl, supabaseJdbcUrl, databaseUrl);
        String username = firstNonBlank(springDatasourceUsername, supabaseDbUser);
        String password = firstNonBlank(springDatasourcePassword, supabaseDbPassword);

        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            throw new IllegalStateException("No datasource URL configured. Set SPRING_DATASOURCE_URL, SUPABASE_JDBC_URL, or DATABASE_URL.");
        }

        ParsedDatabaseUrl parsedDatabaseUrl = parseDatabaseUrl(jdbcUrl);
        jdbcUrl = parsedDatabaseUrl.jdbcUrl();

        if ((username == null || username.isBlank()) && parsedDatabaseUrl.username() != null) {
            username = parsedDatabaseUrl.username();
        }
        if ((password == null || password.isBlank()) && parsedDatabaseUrl.password() != null) {
            password = parsedDatabaseUrl.password();
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");

        if (username != null && !username.isBlank()) {
            dataSource.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            dataSource.setPassword(password);
        }

        return dataSource;
    }

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) -> response.sendError(401, "Unauthorized");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "https://wildvault-frontend.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private ParsedDatabaseUrl parseDatabaseUrl(String rawUrl) {
        if (rawUrl.startsWith("jdbc:")) {
            return new ParsedDatabaseUrl(rawUrl, null, null);
        }

        if (!rawUrl.startsWith("postgres://") && !rawUrl.startsWith("postgresql://")) {
            return new ParsedDatabaseUrl(rawUrl, null, null);
        }

        try {
            URI uri = new URI(rawUrl);
            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                    .append(uri.getHost());

            if (uri.getPort() != -1) {
                jdbcUrl.append(":").append(uri.getPort());
            }

            if (uri.getPath() != null && !uri.getPath().isBlank()) {
                jdbcUrl.append(uri.getPath());
            }

            if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                jdbcUrl.append("?").append(uri.getQuery());
            }

            String username = null;
            String password = null;
            if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                String[] userInfo = uri.getUserInfo().split(":", 2);
                username = userInfo[0];
                if (userInfo.length > 1) {
                    password = userInfo[1];
                }
            }

            return new ParsedDatabaseUrl(jdbcUrl.toString(), username, password);
        } catch (URISyntaxException ex) {
            throw new IllegalStateException("DATABASE_URL is not a valid URI", ex);
        }
    }

    private record ParsedDatabaseUrl(String jdbcUrl, String username, String password) {}
}
