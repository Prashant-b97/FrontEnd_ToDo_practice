# Stage 1: Base image
# Use a lightweight Nginx server image.
FROM nginx:1.25-alpine

# Remove the default Nginx welcome page.
RUN rm -rf /usr/share/nginx/html/*

# Copy the project static files into Nginx's public directory.
COPY ./index.html /usr/share/nginx/html/
COPY ./assets/ /usr/share/nginx/html/assets/

# Expose port 80 from the container to the host.
EXPOSE 80

# Run Nginx in the foreground when the container starts.
CMD ["nginx", "-g", "daemon off;"]
