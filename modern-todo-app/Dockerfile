# Stage 1: Base image
# Hum ek halka Nginx server image use kar rahe hain.
FROM nginx:1.25-alpine

# Default Nginx welcome page ko hata dein.
RUN rm -rf /usr/share/nginx/html/*

# Apne project ke static files ko Nginx ke public directory mein copy karein.
COPY ./index.html /usr/share/nginx/html/
COPY ./assets/ /usr/share/nginx/html/assets/

# Container ke port 80 ko bahar ki duniya ke liye expose karein.
EXPOSE 80

# Container start hone par Nginx ko foreground mein chalane ki command.
CMD ["nginx", "-g", "daemon off;"]