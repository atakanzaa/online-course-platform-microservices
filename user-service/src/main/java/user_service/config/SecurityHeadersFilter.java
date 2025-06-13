package user_service.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Add security headers for OAuth2 compatibility
        httpResponse.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        httpResponse.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
        
        chain.doFilter(request, response);
    }
}
