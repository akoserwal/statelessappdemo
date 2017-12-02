package com.redhat.statelessappdemo.security;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    private static final Log log = LogFactory.getLog(JwtAuthenticationTokenFilter.class);
    private static final String BEARER = "Bearer ";

    @Autowired
    private JWTAccessTokenValidator tokenValidator;

    private final static String tokenHeader = "Authorization";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {

        logger.debug("This is inside the filter");
        String jwtToken = request.getHeader(this.tokenHeader);
        if (jwtToken!=null) {
            logger.debug("JWT found");
            try {

                if (jwtToken.length() > BEARER.length() && jwtToken.startsWith(BEARER)) {
                    jwtToken = jwtToken.substring(BEARER.length());
                }

                String username = tokenValidator.validate(jwtToken);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    // For simple validation it is completely sufficient to just check the token integrity.
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, null, null);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    log.debug("authenticated user " + username + ", setting security context");
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

        }

        chain.doFilter(request, response);
    }
}
