package com.redhat.statelessappdemo.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;
import java.text.ParseException;


@Component
@Configuration
public class JWTAccessTokenValidator {

    private final static Logger logger = Logger.getLogger(JWTAccessTokenValidator.class);

    @Value("${auth.keycloak.host.url}")
    private String authHostUrl;

    private ConfigurableJWTProcessor jwtProcessor = new DefaultJWTProcessor();

    @PostConstruct
    public void init() {
        try {
            //String jwksetUrl = "https://sso.qa.redhat.com/auth/realms/redhat-external/protocol/openid-connect/certs";
            //JWKSource keySource = new RemoteJWKSet(new URL(jwksetUrl));
            //https://auth.dev.redhat.com/auth/realms/EmployeeIDP/protocol/openid-connect/certs

            ClassLoader classLoader = getClass().getClassLoader();
            //JWKSet jwkSet = JWKSet.load(new File("/tmp/jwkset.json"));
            JWKSet jwkSet = JWKSet.load(new URL(authHostUrl + "/auth/realms/EmployeeIDP/protocol/openid-connect/certs"));
            logger.debug("JWT key found at " + authHostUrl);
            JWKSource keySource = new ImmutableJWKSet(jwkSet);

            JWSKeySelector keySelector = new JWSVerificationKeySelector(JWSAlgorithm.RS256, keySource);
            jwtProcessor.setJWSKeySelector(keySelector);
        } catch (ParseException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String validate(String accessToken) throws BadJOSEException {
        SecurityContext ctx = null;

        try {
            JWTClaimsSet claimsSet = jwtProcessor.process(accessToken, ctx);
            return claimsSet.getStringClaim("username");
        } catch (ParseException | JOSEException e) {
            e.printStackTrace();
        }
        return null;
    }
}
